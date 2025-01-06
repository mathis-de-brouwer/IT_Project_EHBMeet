import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { db } from '../../../firebase_backup';
import { collection, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import Colors from '../../../constants/Colors';
import { AuthContext } from '../../_layout';
import UserFooter from '../../../components/footer';
import { EventCategory } from '../../types/event';
import DateTimePicker from '@react-native-community/datetimepicker';

interface EventData {
  Category_id: string;
  Date: string;
  Description: string;
  Event_Title: string;
  Event_picture?: string;
  Location: string;
  Max_Participants: string;
  Phone_Number?: string;
  User_ID: string;
  participants?: string[];
}

export default function ActivityAddScreen() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [event, setEvent] = useState<EventData | null>(null);
  const { eventId, isEditing, returnTo } = useLocalSearchParams();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [adminReason, setAdminReason] = useState('');
  
  const initialEventData: EventData = {
    Category_id: '',
    Date: '',
    Description: '',
    Event_Title: '',
    Event_picture: '',
    Location: '',
    Max_Participants: '',
    Phone_Number: '',
    User_ID: user?.User_ID || '',
    participants: [],
  };
  
  const [eventData, setEventData] = useState<EventData>(initialEventData);

  const isAdmin = user?.role === 'admin';

  // Add this function to check if user can use EHB category
  const canUseEHBCategory = () => {
    if (!user) return false;
    return ['admin', 'ehb', 'enigma'].includes(user.role);
  };

  // Add this to filter available categories based on user role
  const getAvailableCategories = () => {
    const allCategories = [
      { id: 'games', label: 'Games' },
      { id: 'sport', label: 'Sport' },
      { id: 'ehb-events', label: 'EHB Events' },
      { id: 'creativity', label: 'Creative' }
    ];

    return allCategories.filter(category => 
      category.id !== 'ehb-events' || canUseEHBCategory()
    );
  };

  // Add validation for category
  useEffect(() => {
    // If editing an event with EHB category but user doesn't have permission
    if (eventData.Category_id === 'ehb-events' && !canUseEHBCategory()) {
      setEventData(prev => ({
        ...prev,
        Category_id: '' // Reset to empty or default category
      }));
      Alert.alert(
        'Category Restricted',
        'Only EHB staff, Enigma members, and administrators can create EHB events.'
      );
    }
  }, [eventData.Category_id, user]);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;
      
      try {
        const eventDoc = await getDoc(doc(db, 'Event', eventId as string));
        if (eventDoc.exists()) {
          const existingEvent = eventDoc.data() as EventData;
          console.log("Fetched event data:", existingEvent); // Debug log
          
          // Set all existing event data, including participants
          setEventData({
            Event_Title: existingEvent.Event_Title,
            Description: existingEvent.Description || '',
            Date: existingEvent.Date,
            Location: existingEvent.Location,
            Max_Participants: existingEvent.Max_Participants,
            Category_id: existingEvent.Category_id,
            Phone_Number: existingEvent.Phone_Number || '',
            User_ID: existingEvent.User_ID,
            participants: existingEvent.participants || [], // Preserve participants
          });
          
          // If there's a date, set it in the date picker
          if (existingEvent.Date) {
            setDate(new Date(existingEvent.Date));
          }
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        Alert.alert('Error', 'Failed to load event data');
      }
    };

    if (isEditing === '1') {
      fetchEvent();
    }
  }, [eventId, isEditing]);

  const resetForm = () => {
    setEventData(initialEventData);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      // Format date for database
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setEventData({ ...eventData, Date: formattedDate });
    }
  };

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'Event_Title':
        return !value.trim() ? 'Event title is required' : 
               value.length < 3 ? 'Title must be at least 3 characters' : '';
      case 'Date':
        return !value ? 'Date is required' : 
               new Date(value) < new Date() ? 'Date cannot be in the past' : '';
      case 'Location':
        return !value.trim() ? 'Location is required' : 
               value.length < 3 ? 'Location must be at least 3 characters' : '';
      case 'Max_Participants':
        return !value ? 'Maximum participants is required' :
               isNaN(Number(value)) ? 'Must be a number' :
               Number(value) < 1 ? 'Must be at least 1' :
               Number(value) > 100 ? 'Maximum 100 participants allowed' : '';
      case 'Category_id':
        return !value ? 'Category is required' : '';
      case 'Phone_Number':
        if (!value) return ''; // Optional field
        const phoneRegex = /^\+?[\d\s-]{8,}$/;
        return !phoneRegex.test(value) ? 'Invalid phone number format' : '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

    Object.keys(eventData).forEach(key => {
      const value = Array.isArray(eventData[key as keyof EventData]) 
        ? '' 
        : (eventData[key as keyof EventData] || '').toString();
      const error = validateField(key, value);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    // Mark all fields as touched
    const allTouched = Object.keys(eventData).reduce((acc, key) => ({
      ...acc,
      [key]: true
    }), {});
    setTouched(allTouched);

    // Validate all fields
    if (!validateForm()) {
      Alert.alert('Error', 'Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing === '1' && typeof eventId === 'string') {
        if (isAdmin) {
          if (Platform.OS === 'ios') {
            Alert.prompt(
              'Admin Edit Reason',
              'Please provide a reason for this edit:',
              [
                {
                  text: 'Cancel',
                  onPress: () => setIsSubmitting(false),
                  style: 'cancel'
                },
                {
                  text: 'Submit',
                  onPress: async (reason?: string) => {
                    if (!reason) {
                      Alert.alert('Error', 'A reason is required for admin edits');
                      setIsSubmitting(false);
                      return;
                    }
                    await updateEventWithNotifications(reason);
                  }
                }
              ],
              'plain-text'
            );
          } else {
            // Show custom modal for web and Android
            setShowReasonModal(true);
          }
        } else {
          await updateEventWithNotifications();
        }
      } else {
        // Create new event
        await addDoc(collection(db, "Event"), {
          ...eventData,
          User_ID: user?.User_ID,
          Created_At: new Date().toISOString(),
        });

        Alert.alert('Success', 'Event created successfully!', [
          { 
            text: 'OK', 
            onPress: () => {
              resetForm();
              router.replace('/(app)/home');
            }
          }
        ]);
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to save event');
      setIsSubmitting(false);
    }
  };

  const updateEventWithNotifications = async (adminReason?: string) => {
    const eventRef = doc(db, 'Event', eventId as string);
    const eventDoc = await getDoc(eventRef);
    const currentEvent = eventDoc.data();

    const updateData = {
      ...eventData,
      participants: currentEvent?.participants || [],
      Last_Modified: new Date().toISOString(),
    };

    await updateDoc(eventRef, updateData);

    // Add notification logic here
    const participants = currentEvent?.participants || [];
    const creatorId = currentEvent?.User_ID;
    const usersToNotify = [...new Set([...participants, creatorId])];
    
    await Promise.all(usersToNotify.map(userId => 
      addDoc(collection(db, 'Notifications'), {
        type: isAdmin ? 'admin_event_edit' : 'event_edited',
        userId: userId,
        userName: user?.email || 'Admin',
        eventId: eventId,
        eventTitle: updateData.Event_Title,
        createdAt: new Date().toISOString(),
        read: false,
        ...(adminReason && { adminReason })
      })
    ));

    Alert.alert('Success', 'Event updated successfully!', [
      { 
        text: 'OK', 
        onPress: () => {
          if (isAdmin || returnTo === 'admin') {
            router.replace('/(app)/(admin)/events');
          } else if (returnTo === 'agenda') {
            router.replace('/(app)/agenda');
          } else {
            router.replace('/(app)/home');
          }
        }
      }
    ]);
  };

  const handleInputChange = (name: keyof EventData, value: string) => {
    setEventData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: validateField(name, value)
      }));
    }
  };

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const value = Array.isArray(eventData[name as keyof EventData])
      ? ''
      : (eventData[name as keyof EventData] || '').toString();
    setErrors(prev => ({
      ...prev,
      [name]: validateField(name, value)
    }));
  };

  const title = eventId ? 'Edit Event' : 'Create New Event';

  const handleParticipantPress = (participantId: string) => {
    router.push({
      pathname: '/profile/profile_info',
      params: { userId: participantId }
    });
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        
        <View style={styles.formSection}>
          <Text style={styles.label}>Event Title *</Text>
          <TextInput
            style={[styles.input, errors.Event_Title && styles.inputError]}
            placeholder="Enter event title"
            placeholderTextColor={Colors.placeholder}
            value={eventData.Event_Title}
            onChangeText={(text) => handleInputChange('Event_Title', text)}
            onBlur={() => handleBlur('Event_Title')}
          />
          {touched.Event_Title && errors.Event_Title && (
            <Text style={styles.errorText}>{errors.Event_Title}</Text>
          )}

          <Text style={styles.label}>Date *</Text>
          {Platform.OS === 'web' ? (
            <TextInput
              style={[styles.input, errors.Date && styles.inputError]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={Colors.placeholder}
              value={eventData.Date}
              onChangeText={(text) => handleInputChange('Date', text)}
              onBlur={() => handleBlur('Date')}
              {...(Platform.OS === 'web' ? { type: 'date' } : {})}
            />
          ) : (
            <TouchableOpacity 
              style={[styles.input, errors.Date && styles.inputError]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[styles.inputText, !eventData.Date && styles.placeholder]}>
                {eventData.Date || 'Select Date'}
              </Text>
            </TouchableOpacity>
          )}
          {touched.Date && errors.Date && (
            <Text style={styles.errorText}>{errors.Date}</Text>
          )}

          {Platform.OS !== 'web' && showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setDate(selectedDate);
                  const formattedDate = selectedDate.toISOString().split('T')[0];
                  setEventData({ ...eventData, Date: formattedDate });
                }
              }}
            />
          )}

          <Text style={styles.label}>Location *</Text>
          <TextInput
            style={[styles.input, errors.Location && styles.inputError]}
            placeholder="Enter location"
            placeholderTextColor={Colors.placeholder}
            value={eventData.Location}
            onChangeText={(text) => handleInputChange('Location', text)}
            onBlur={() => handleBlur('Location')}
          />
          {touched.Location && errors.Location && (
            <Text style={styles.errorText}>{errors.Location}</Text>
          )}

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter description"
            placeholderTextColor={Colors.placeholder}
            value={eventData.Description}
            onChangeText={(text) => setEventData({...eventData, Description: text})}
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Maximum Participants *</Text>
          <TextInput
            style={[styles.input, errors.Max_Participants && styles.inputError]}
            placeholder="Enter maximum participants"
            placeholderTextColor={Colors.placeholder}
            value={eventData.Max_Participants}
            onChangeText={(text) => handleInputChange('Max_Participants', text)}
            onBlur={() => handleBlur('Max_Participants')}
            keyboardType="numeric"
          />
          {touched.Max_Participants && errors.Max_Participants && (
            <Text style={styles.errorText}>{errors.Max_Participants}</Text>
          )}

          <Text style={styles.label}>Category *</Text>
          <View style={styles.categoryContainer}>
            {getAvailableCategories().map(({ id, label }) => (
              <TouchableOpacity
                key={id}
                style={[
                  styles.categoryButton,
                  eventData.Category_id === id && styles.categoryButtonSelected,
                  id === 'ehb-events' && styles.ehbCategory
                ]}
                onPress={() => handleInputChange('Category_id', id)}
              >
                <Text style={[
                  styles.categoryButtonText,
                  eventData.Category_id === id && styles.categoryButtonTextSelected
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {touched.Category_id && errors.Category_id && (
            <Text style={styles.errorText}>{errors.Category_id}</Text>
          )}

          <Text style={styles.label}>Phone Number (Optional)</Text>
          <TextInput
            style={[styles.input, errors.Phone_Number && styles.inputError]}
            placeholder="Enter phone number"
            placeholderTextColor={Colors.placeholder}
            value={eventData.Phone_Number}
            onChangeText={(text) => handleInputChange('Phone_Number', text)}
            onBlur={() => handleBlur('Phone_Number')}
            keyboardType="phone-pad"
          />
          {touched.Phone_Number && errors.Phone_Number && (
            <Text style={styles.errorText}>{errors.Phone_Number}</Text>
          )}

          <TouchableOpacity 
            style={[styles.submitButton, isSubmitting && styles.buttonDisabled]} 
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting 
                ? (isEditing === '1' ? 'Updating...' : 'Creating...') 
                : (isEditing === '1' ? 'Update Event' : 'Create Event')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <UserFooter />
      {showReasonModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Admin Edit Reason</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter reason for edit"
              value={adminReason}
              onChangeText={setAdminReason}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => {
                  setShowReasonModal(false);
                  setIsSubmitting(false);
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalSubmitButton]}
                onPress={async () => {
                  if (!adminReason.trim()) {
                    Alert.alert('Error', 'A reason is required for admin edits');
                    return;
                  }
                  setShowReasonModal(false);
                  await updateEventWithNotifications(adminReason);
                }}
              >
                <Text style={styles.modalButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.text,
  },
  formSection: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    width: '100%',
    minHeight: 50,
    borderColor: Colors.inputBorder,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: Colors.inputBackground,
    fontSize: 16,
    color: Colors.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: 'white',
  },
  categoryButtonSelected: {
    backgroundColor: Colors.primary,
  },
  categoryButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  categoryButtonTextSelected: {
    color: 'white',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  inputText: {
    fontSize: 16,
    color: Colors.text,
  },
  placeholder: {
    color: Colors.placeholder,
  },
  inputError: {
    borderColor: Colors.error,
    borderWidth: 1,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  ehbCategory: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  modalOverlay: Platform.select({
    web: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      width: '100%',
      height: '100%',
    },
    default: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    }
  }),
  modalContent: Platform.select({
    web: {
      backgroundColor: 'white',
      padding: 20,
      borderRadius: 10,
      width: '80%',
      maxWidth: 400,
      elevation: 5,
    },
    default: {
      backgroundColor: 'white',
      padding: 20,
      borderRadius: 10,
      width: '80%',
      maxWidth: 400,
    }
  }),
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.text,
  },
  modalInput: {
    width: '100%',
    minHeight: 100,
    borderColor: Colors.inputBorder,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: Colors.inputBackground,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalSubmitButton: {
    backgroundColor: Colors.primary,
  },
});