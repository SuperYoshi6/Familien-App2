// App.js - React Native Familien-App
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  StatusBar,
  SafeAreaView,
  Modal,
  FlatList,
  Dimensions,
  Switch
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
const supabaseUrl = 'https://hjkmfodzhradtkeiyele.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhqa21mb2R6aHJhZHRrZWl5ZWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0ODIwNjEsImV4cCI6MjA2ODA1ODA2MX0.2cfezsLcT6x3KI9VqzrHntP80O-cy0JQUb7UK3Mnai8';
const supabase = createClient(supabaseUrl, supabaseKey);

// OpenWeatherMap API Key
const WEATHER_API_KEY = 'a00136db1232d2004edd6421151bd519';

const { width, height } = Dimensions.get('window');

const FamilyApp = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('news');
  const [darkMode, setDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // User Management
  const [users, setUsers] = useState([]);
  const [loginData, setLoginData] = useState({ name: '', password: '' });
  const [showRegister, setShowRegister] = useState(false);

  // App Data
  const [news, setNews] = useState([]);
  const [foodOrders, setFoodOrders] = useState([]);
  const [familyEvents, setFamilyEvents] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [houseworkTasks, setHouseworkTasks] = useState([]);
  const [personalTodos, setPersonalTodos] = useState([]);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState<any[]>([]);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState({});

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    loadStoredData();
    fetchWeather();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser]);

  const loadStoredData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('currentUser');
      const storedDarkMode = await AsyncStorage.getItem('darkMode');
      
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
      if (storedDarkMode) {
        setDarkMode(JSON.parse(storedDarkMode));
      }
    } catch (error) {
      console.error('Error loading stored data:', error);
    }
  };

  const loadUserData = async () => {
    try {
      // Load data from Supabase or local storage
      // For demo purposes, using initial data
      setUsers([
        { id: 1, name: 'Admin', password: 'admin', isAdmin: true, role: 'Eltern' },
        { id: 2, name: 'Mama', password: 'mama123', isAdmin: false, role: 'Eltern' },
        { id: 3, name: 'Papa', password: 'papa123', isAdmin: false, role: 'Eltern' },
        { id: 4, name: 'Kind1', password: 'kind123', isAdmin: false, role: 'Kind' },
        { id: 5, name: 'Kind2', password: 'kind456', isAdmin: false, role: 'Kind' }
      ]);

      setNews([
        { id: 1, title: 'Willkommen in der Familien-App!', content: 'Hier können alle wichtigen Familiennachrichten geteilt werden.', author: 1, date: '2025-07-26', time: '10:00' }
      ]);

      setFamilyEvents([
        { id: 1, title: 'Zahnarzt Termin', date: '2025-07-28', startTime: '10:00', endTime: '11:00', assignedTo: [2, 3], createdBy: 1 }
      ]);

      setShoppingList([
        { id: 1, item: 'Milch', completed: false, addedBy: 1 },
        { id: 2, item: 'Brot', completed: true, addedBy: 2 }
      ]);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const fetchWeather = async () => {
    try {
      const currentResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=Alzey,DE&appid=${WEATHER_API_KEY}&units=metric&lang=de`
      );
      const currentData = await currentResponse.json();
      setWeather(currentData);

      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=Alzey,DE&appid=${WEATHER_API_KEY}&units=metric&lang=de`
      );
      const forecastData = await forecastResponse.json();
      
      const dailyForecasts: any[] = [];
      const processedDates = new Set<string>();
      
      forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000).toDateString();
        if (!processedDates.has(date) && dailyForecasts.length < 5) {
          dailyForecasts.push(item);
          processedDates.add(date);
        }
      });
      
      setForecast(dailyForecasts);
    } catch (error) {
      console.error('Weather fetch error:', error);
    }
  };

  const handleLogin = async () => {
    if (loginData.name && loginData.password) {
      const user = users.find(u => u.name === loginData.name && u.password === loginData.password);
      if (user) {
        setCurrentUser(user);
        await AsyncStorage.setItem('currentUser', JSON.stringify(user));
        setLoginData({ name: '', password: '' });
      } else {
        Alert.alert('Fehler', 'Ungültige Anmeldedaten!');
      }
    }
  };

  const handleRegister = async () => {
    if (loginData.name && loginData.password) {
      const newUser = {
        id: Date.now(),
        name: loginData.name,
        password: loginData.password,
        isAdmin: false,
        role: 'Kind'
      };
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      setCurrentUser(newUser);
      await AsyncStorage.setItem('currentUser', JSON.stringify(newUser));
      setLoginData({ name: '', password: '' });
      setShowRegister(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('currentUser');
    setCurrentUser(null);
    setActiveTab('news');
  };

  const toggleDarkMode = async () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    await AsyncStorage.setItem('darkMode', JSON.stringify(newDarkMode));
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unbekannt';
  };

  const openAddModal = (type) => {
    setModalType(type);
    setModalData({});
    setShowAddModal(true);
  };

  const handleAddItem = () => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const currentDate = now.toISOString().split('T')[0];

    switch (modalType) {
      case 'news':
        if (modalData.title && modalData.content) {
          const newNews = {
            id: Date.now(),
            title: modalData.title,
            content: modalData.content,
            author: currentUser.id,
            date: currentDate,
            time: currentTime
          };
          setNews([newNews, ...news]);
        }
        break;

      case 'food':
        if (modalData.item) {
          const newOrder = {
            id: Date.now(),
            item: modalData.item,
            orderedBy: currentUser.id,
            timestamp: `${currentDate} ${currentTime}`,
            status: 'bestellt'
          };
          setFoodOrders([newOrder, ...foodOrders]);
        }
        break;

      case 'shopping':
        if (modalData.item) {
          const newItem = {
            id: Date.now(),
            item: modalData.item,
            completed: false,
            addedBy: currentUser.id
          };
          setShoppingList([...shoppingList, newItem]);
        }
        break;

      case 'todo':
        if (modalData.todo) {
          const newTodo = {
            id: Date.now(),
            todo: modalData.todo,
            userId: currentUser.id,
            completed: false
          };
          setPersonalTodos([...personalTodos, newTodo]);
        }
        break;
    }

    setShowAddModal(false);
    setModalData({});
  };

  const toggleShoppingItem = (id) => {
    setShoppingList(shoppingList.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const togglePersonalTodo = (id) => {
    setPersonalTodos(personalTodos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setFoodOrders(foodOrders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  // Styles
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: darkMode ? '#111827' : '#f8fafc',
    },
    loginContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: darkMode ? '#111827' : '#f0f9ff',
    },
    loginCard: {
      width: '100%',
      maxWidth: 400,
      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
      borderRadius: 16,
      padding: 32,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 8,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 32,
    },
    logo: {
      width: 64,
      height: 64,
      borderRadius: 16,
      backgroundColor: '#3b82f6',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    logoText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#3b82f6',
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: darkMode ? '#9ca3af' : '#6b7280',
      textAlign: 'center',
      marginTop: 8,
    },
    inputContainer: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: darkMode ? '#d1d5db' : '#374151',
      marginBottom: 8,
    },
    input: {
      backgroundColor: darkMode ? '#374151' : '#f9fafb',
      borderWidth: 1,
      borderColor: darkMode ? '#4b5563' : '#d1d5db',
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: darkMode ? '#ffffff' : '#111827',
    },
    passwordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    passwordInput: {
      flex: 1,
      backgroundColor: darkMode ? '#374151' : '#f9fafb',
      borderWidth: 1,
      borderColor: darkMode ? '#4b5563' : '#d1d5db',
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: darkMode ? '#ffffff' : '#111827',
    },
    eyeButton: {
      position: 'absolute',
      right: 12,
      padding: 4,
    },
    loginButton: {
      backgroundColor: '#3b82f6',
      borderRadius: 8,
      padding: 16,
      alignItems: 'center',
      marginTop: 8,
    },
    loginButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
    switchButton: {
      alignItems: 'center',
      marginTop: 24,
    },
    switchButtonText: {
      color: '#3b82f6',
      fontSize: 16,
      fontWeight: '500',
    },
    darkModeToggle: {
      alignItems: 'center',
      marginTop: 16,
    },
    header: {
      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
      paddingHorizontal: 20,
      paddingVertical: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: darkMode ? '#374151' : '#e5e7eb',
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerLogo: {
      width: 40,
      height: 40,
      borderRadius: 8,
      backgroundColor: '#3b82f6',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#3b82f6',
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    userInfo: {
      fontSize: 14,
      color: darkMode ? '#d1d5db' : '#6b7280',
      marginRight: 16,
    },
    headerButton: {
      padding: 8,
      marginLeft: 8,
    },
    mainContent: {
      flex: 1,
      flexDirection: 'row',
    },
    sidebar: {
      width: 280,
      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
      borderRightWidth: 1,
      borderRightColor: darkMode ? '#374151' : '#e5e7eb',
      padding: 16,
    },
    tabButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
    },
    activeTab: {
      backgroundColor: '#3b82f6',
    },
    inactiveTab: {
      backgroundColor: 'transparent',
    },
    tabIcon: {
      marginRight: 12,
    },
    tabText: {
      fontSize: 16,
      fontWeight: '500',
    },
    activeTabText: {
      color: '#ffffff',
    },
    inactiveTabText: {
      color: darkMode ? '#d1d5db' : '#374151',
    },
    content: {
      flex: 1,
      backgroundColor: darkMode ? '#111827' : '#f8fafc',
      padding: 20,
    },
    contentCard: {
      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
      borderRadius: 12,
      padding: 20,
      minHeight: height - 200,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: darkMode ? '#ffffff' : '#111827',
    },
    addButton: {
      backgroundColor: '#10b981',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    addButtonText: {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 8,
    },
    newsItem: {
      backgroundColor: darkMode ? '#374151' : '#f9fafb',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderLeftWidth: 4,
      borderLeftColor: '#3b82f6',
    },
    newsTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: darkMode ? '#ffffff' : '#111827',
      marginBottom: 8,
    },
    newsContent: {
      fontSize: 16,
      color: darkMode ? '#d1d5db' : '#6b7280',
      marginBottom: 8,
      lineHeight: 24,
    },
    newsFooter: {
      fontSize: 12,
      color: darkMode ? '#9ca3af' : '#9ca3af',
    },
    weatherCard: {
      backgroundColor: darkMode ? '#374151' : '#f0f9ff',
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
    },
    weatherHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    weatherTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: darkMode ? '#ffffff' : '#111827',
    },
    weatherTemp: {
      fontSize: 32,
      fontWeight: 'bold',
      color: darkMode ? '#ffffff' : '#111827',
    },
    weatherFeels: {
      fontSize: 14,
      color: darkMode ? '#9ca3af' : '#6b7280',
    },
    weatherDetails: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 16,
    },
    weatherDetail: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '50%',
      marginBottom: 8,
    },
    weatherDetailText: {
      fontSize: 14,
      color: darkMode ? '#d1d5db' : '#6b7280',
      marginLeft: 8,
    },
    forecastCard: {
      backgroundColor: darkMode ? '#374151' : '#ffffff',
      borderRadius: 8,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    forecastDate: {
      fontSize: 16,
      fontWeight: '500',
      color: darkMode ? '#ffffff' : '#111827',
    },
    forecastDesc: {
      fontSize: 14,
      color: darkMode ? '#9ca3af' : '#6b7280',
    },
    forecastTemp: {
      fontSize: 16,
      fontWeight: '600',
      color: darkMode ? '#ffffff' : '#111827',
    },
    listItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: darkMode ? '#374151' : '#f9fafb',
      borderRadius: 8,
      padding: 16,
      marginBottom: 8,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: '#3b82f6',
      marginRight: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkedBox: {
      backgroundColor: '#3b82f6',
    },
    itemText: {
      flex: 1,
      fontSize: 16,
      color: darkMode ? '#ffffff' : '#111827',
    },
    completedText: {
      textDecorationLine: 'line-through',
      color: '#9ca3af',
    },
    itemMeta: {
      fontSize: 12,
      color: darkMode ? '#9ca3af' : '#6b7280',
      marginTop: 4,
    },
    modal: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
      borderRadius: 16,
      padding: 24,
      width: '90%',
      maxWidth: 400,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: darkMode ? '#ffffff' : '#111827',
      marginBottom: 20,
    },
    modalInput: {
      backgroundColor: darkMode ? '#374151' : '#f9fafb',
      borderWidth: 1,
      borderColor: darkMode ? '#4b5563' : '#d1d5db',
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: darkMode ? '#ffffff' : '#111827',
      marginBottom: 16,
    },
    modalTextArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    modalButton: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 4,
    },
    modalCancelButton: {
      backgroundColor: darkMode ? '#4b5563' : '#e5e7eb',
    },
    modalConfirmButton: {
      backgroundColor: '#3b82f6',
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    modalCancelText: {
      color: darkMode ? '#d1d5db' : '#374151',
    },
    modalConfirmText: {
      color: '#ffffff',
    },
    settingsSection: {
      backgroundColor: darkMode ? '#374151' : '#f9fafb',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    settingsTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: darkMode ? '#ffffff' : '#111827',
      marginBottom: 12,
    },
    settingsItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    },
    settingsText: {
      fontSize: 16,
      color: darkMode ? '#d1d5db' : '#374151',
    },
    settingsDesc: {
      fontSize: 14,
      color: darkMode ? '#9ca3af' : '#6b7280',
      marginTop: 4,
    },
  });

  // Login Screen
  if (!currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />
        <View style={styles.loginContainer}>
          <View style={styles.loginCard}>
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Text style={{ color: '#ffffff', fontSize: 24 }}>👨‍👩‍👧‍👦</Text>
              </View>
              <Text style={styles.logoText}>Familien App</Text>
              <Text style={styles.subtitle}>Willkommen zurück!</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={loginData.name}
                onChangeText={(text) => setLoginData({...loginData, name: text})}
                placeholder="Dein Name"
                placeholderTextColor={darkMode ? '#9ca3af' : '#6b7280'}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Passwort</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={loginData.password}
                  onChangeText={(text) => setLoginData({...loginData, password: text})}
                  placeholder="Dein Passwort"
                  placeholderTextColor={darkMode ? '#9ca3af' : '#6b7280'}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.loginButton}
              onPress={showRegister ? handleRegister : handleLogin}
            >
              <Text style={styles.loginButtonText}>
                {showRegister ? 'Registrieren' : 'Anmelden'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.switchButton}
              onPress={() => setShowRegister(!showRegister)}
            >
              <Text style={styles.switchButtonText}>
                {showRegister ? 'Bereits registriert? Anmelden' : 'Neu hier? Registrieren'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.darkModeToggle}
              onPress={toggleDarkMode}
            >
              <Text style={{ fontSize: 24 }}>{darkMode ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Tab Configuration
  const tabs = [
    { id: 'news', name: 'News', icon: '📰' },
    { id: 'food-orders', name: 'Essen bestellen', icon: '🍽️' },
    { id: 'family-calendar', name: 'Familienkalender', icon: '📅' },
    { id: 'personal-calendar', name: 'Mein Kalender', icon: '👤' },
    { id: 'weather', name: 'Wetter', icon: '🌤️' },
    { id: 'shopping', name: 'Einkaufsliste', icon: '🛒' },
    { id: 'housework', name: 'Hausarbeiten', icon: '🏠' },
    { id: 'personal-todos', name: 'Meine Aufgaben', icon: '✅' },
    { id: 'settings', name: 'Einstellungen', icon: '⚙️' }
  ];

  // Render Content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'news':
        return (
          <ScrollView>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Familien News</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => openAddModal('news')}
              >
                <Text style={{ color: '#ffffff', fontSize: 16 }}>+</Text>
                <Text style={styles.addButtonText}>News hinzufügen</Text>
              </TouchableOpacity>
            </View>
            
            {news.map((item) => (
              <View key={item.id} style={styles.newsItem}>
                <Text style={styles.newsTitle}>{item.title}</Text>
                <Text style={styles.newsContent}>{item.content}</Text>
                <Text style={styles.newsFooter}>
                  Von: {getUserName(item.author)} • {item.date} um {item.time}
                </Text>
              </View>
            ))}
          </ScrollView>
        );

      case 'weather':
        return (
          <ScrollView>
            <Text style={styles.sectionTitle}>Wetter in Alzey</Text>
            
            {weather && (
              <View style={styles.weatherCard}>
                <View style={styles.weatherHeader}>
                  <View>
                    <Text style={styles.weatherTitle}>Aktuelles Wetter</Text>
                    <Text style={[styles.newsContent, { marginBottom: 0 }]}>
                      {weather.weather[0].description}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.weatherTemp}>
                      {Math.round(weather.main.temp)}°C
                    </Text>
                    <Text style={styles.weatherFeels}>
                      Gefühlt {Math.round(weather.main.feels_like)}°C
                    </Text>
                  </View>
                </View>
                
                <View style={styles.weatherDetails}>
                  <View style={styles.weatherDetail}>
                    <Text>💧</Text>
                    <Text style={styles.weatherDetailText}>
                      Luftfeuchtigkeit: {weather.main.humidity}%
                    </Text>
                  </View>
                  <View style={styles.weatherDetail}>
                    <Text>💨</Text>
                    <Text style={styles.weatherDetailText}>
                      Wind: {Math.round(weather.wind.speed * 3.6)} km/h
                    </Text>
                  </View>
                  <View style={styles.weatherDetail}>
                    <Text>🌡️</Text>
                    <Text style={styles.weatherDetailText}>
                      Min/Max: {Math.round(weather.main.temp_min)}°/{Math.round(weather.main.temp_max)}°
                    </Text>
                  </View>
                  <View style={styles.weatherDetail}>
                    <Text>👁️</Text>
                    <Text style={styles.weatherDetailText}>
                      Sicht: {Math.round(weather.visibility / 1000)} km
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <Text style={[styles.weatherTitle, { marginBottom: 16 }]}>5-Tage Vorhersage</Text>
            {forecast.map((day, index) => (
              <View key={index} style={styles.forecastCard}>
                <View>
                  <Text style={styles.forecastDate}>
                    {new Date(day.dt * 1000).toLocaleDateString('de-DE', { 
                      weekday: 'long', day: 'numeric', month: 'short' 
                    })}
                  </Text>
                  <Text style={styles.forecastDesc}>{day.weather[0].description}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.forecastTemp}>
                    {Math.round(day.main.temp)}°C
                  </Text>
                  <Text style={styles.forecastDesc}>
                    {Math.round(day.main.humidity)}% Luftfeuchtigkeit
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        );

      case 'food-orders':
        const isChild = currentUser.role === 'Kind';
        const isParent = currentUser.role === 'Eltern';
        
        return (
          <ScrollView>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {isChild ? 'Essen bestellen' : 'Essens-Bestellungen'}
              </Text>
              {isChild && (
                <TouchableOpacity 
                  style={[styles.addButton, { backgroundColor: '#f59e0b' }]}
                  onPress={() => openAddModal('food')}
                >
                  <Text style={{ color: '#ffffff', fontSize: 16 }}>🍽️</Text>
                  <Text style={styles.addButtonText}>Bestellen</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {foodOrders.map((order) => (
              <View key={order.id} style={[styles.newsItem, { borderLeftColor: '#f59e0b' }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.newsTitle}>{order.item}</Text>
                    <Text style={styles.newsContent}>
                      Bestellt von: {getUserName(order.orderedBy)}
                    </Text>
                    <Text style={styles.newsFooter}>{order.timestamp}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <View style={{
                      paddingHorizontal: 12,
                      paddingVertical: 4,
                      borderRadius: 12,
                      backgroundColor: 
                        order.status === 'bestellt' ? '#fef3c7' :
                        order.status === 'in Bearbeitung' ? '#dbeafe' : '#d1fae5'
                    }}>
                      <Text style={{
                        fontSize: 12,
                        fontWeight: '600',
                        color: 
                          order.status === 'bestellt' ? '#d97706' :
                          order.status === 'in Bearbeitung' ? '#2563eb' : '#059669'
                      }}>
                        {order.status}
                      </Text>
                    </View>
                    {isParent && (
                      <TouchableOpacity
                        style={{
                          marginTop: 8,
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          backgroundColor: '#3b82f6',
                          borderRadius: 6
                        }}
                        onPress={() => {
                          const statuses = ['bestellt', 'in Bearbeitung', 'fertig'];
                          const currentIndex = statuses.indexOf(order.status);
                          const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                          updateOrderStatus(order.id, nextStatus);
                        }}
                      >
                        <Text style={{ color: '#ffffff', fontSize: 12 }}>Status ändern</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        );

      case 'shopping':
        return (
          <ScrollView>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Einkaufsliste</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => openAddModal('shopping')}
              >
                <Text style={{ color: '#ffffff', fontSize: 16 }}>+</Text>
                <Text style={styles.addButtonText}>Artikel hinzufügen</Text>
              </TouchableOpacity>
            </View>
            
            {shoppingList.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.listItem}
                onPress={() => toggleShoppingItem(item.id)}
              >
                <View style={[styles.checkbox, item.completed && styles.checkedBox]}>
                  {item.completed && <Text style={{ color: '#ffffff', fontSize: 12 }}>✓</Text>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.itemText, item.completed && styles.completedText]}>
                    {item.item}
                  </Text>
                  <Text style={styles.itemMeta}>
                    Hinzugefügt von: {getUserName(item.addedBy)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        );

      case 'personal-todos':
        const myTodos = personalTodos.filter(todo => todo.userId === currentUser.id);
        
        return (
          <ScrollView>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Meine Aufgaben</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => openAddModal('todo')}
              >
                <Text style={{ color: '#ffffff', fontSize: 16 }}>+</Text>
                <Text style={styles.addButtonText}>Aufgabe hinzufügen</Text>
              </TouchableOpacity>
            </View>
            
            {myTodos.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Text style={{ fontSize: 48, marginBottom: 16 }}>✅</Text>
                <Text style={[styles.newsContent, { textAlign: 'center' }]}>
                  Keine persönlichen Aufgaben
                </Text>
              </View>
            ) : (
              myTodos.map((todo) => (
                <TouchableOpacity 
                  key={todo.id} 
                  style={styles.listItem}
                  onPress={() => togglePersonalTodo(todo.id)}
                >
                  <View style={[styles.checkbox, todo.completed && styles.checkedBox]}>
                    {todo.completed && <Text style={{ color: '#ffffff', fontSize: 12 }}>✓</Text>}
                  </View>
                  <Text style={[styles.itemText, todo.completed && styles.completedText]}>
                    {todo.todo}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        );

      case 'personal-calendar':
        const myEvents = familyEvents.filter(event => event.assignedTo.includes(currentUser.id));
        
        return (
          <ScrollView>
            <Text style={styles.sectionTitle}>Mein Kalender</Text>
            
            {myEvents.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Text style={{ fontSize: 48, marginBottom: 16 }}>📅</Text>
                <Text style={[styles.newsContent, { textAlign: 'center' }]}>
                  Keine Termine für dich geplant
                </Text>
              </View>
            ) : (
              myEvents.map((event) => (
                <View key={event.id} style={[styles.newsItem, { borderLeftColor: '#8b5cf6' }]}>
                  <Text style={styles.newsTitle}>{event.title}</Text>
                  <Text style={styles.newsContent}>
                    📅 {event.date}
                  </Text>
                  <Text style={styles.newsContent}>
                    🕐 {event.startTime} - {event.endTime}
                  </Text>
                  <Text style={styles.newsFooter}>
                    Erstellt von: {getUserName(event.createdBy)}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        );

      case 'settings':
        return (
          <ScrollView>
            <Text style={styles.sectionTitle}>Einstellungen</Text>
            
            <View style={styles.settingsSection}>
              <Text style={styles.settingsTitle}>Design</Text>
              <View style={styles.settingsItem}>
                <View>
                  <Text style={styles.settingsText}>Dark Mode</Text>
                  <Text style={styles.settingsDesc}>
                    Wechsle zwischen hellem und dunklem Design
                  </Text>
                </View>
                <Switch
                  value={darkMode}
                  onValueChange={toggleDarkMode}
                  trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                  thumbColor={darkMode ? '#ffffff' : '#f3f4f6'}
                />
              </View>
            </View>

            {currentUser.isAdmin && (
              <View style={styles.settingsSection}>
                <Text style={styles.settingsTitle}>Benutzerverwaltung (Admin)</Text>
                {users.filter(user => user.id !== currentUser.id).map(user => (
                  <View key={user.id} style={[styles.settingsItem, { paddingVertical: 12 }]}>
                    <View>
                      <Text style={styles.settingsText}>{user.name}</Text>
                      <Text style={styles.settingsDesc}>
                        {user.role} {user.isAdmin && '(Admin)'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={{
                        backgroundColor: '#3b82f6',
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 6
                      }}
                      onPress={() => {
                        Alert.prompt(
                          'Passwort ändern',
                          `Neues Passwort für ${user.name}:`,
                          (newPassword) => {
                            if (newPassword) {
                              const updatedUsers = users.map(u => 
                                u.id === user.id ? { ...u, password: newPassword } : u
                              );
                              setUsers(updatedUsers);
                              Alert.alert('Erfolg', 'Passwort erfolgreich geändert!');
                            }
                          }
                        );
                      }}
                    >
                      <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '600' }}>
                        Passwort ändern
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.settingsSection}>
              <Text style={styles.settingsTitle}>Account</Text>
              <View style={[styles.settingsItem, { paddingVertical: 12 }]}>
                <View>
                  <Text style={styles.settingsText}>
                    Angemeldet als: {currentUser.name}
                  </Text>
                  <Text style={styles.settingsDesc}>
                    Rolle: {currentUser.role} {currentUser.isAdmin && '(Administrator)'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={{
                  backgroundColor: '#ef4444',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 12,
                  borderRadius: 8,
                  marginTop: 16
                }}
                onPress={handleLogout}
              >
                <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
                  🚪 Abmelden
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.settingsSection}>
              <Text style={styles.settingsTitle}>Über die App</Text>
              <Text style={styles.settingsDesc}>
                Familien-App Version 2.0{'\n'}
                Entwickelt für die beste Familienorganisation{'\n'}
                Features: Kalender, Wetter, News, Einkaufsliste und mehr{'\n'}
                Datenbank: Supabase{'\n'}
                Wetter: OpenWeatherMap
              </Text>
            </View>
          </ScrollView>
        );

      default:
        return (
          <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🚧</Text>
            <Text style={[styles.newsContent, { textAlign: 'center' }]}>
              Dieser Bereich ist noch in Entwicklung
            </Text>
          </View>
        );
    }
  };

  // Main App Screen
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerLogo}>
            <Text style={{ color: '#ffffff', fontSize: 20 }}>👨‍👩‍👧‍👦</Text>
          </View>
          <Text style={styles.headerTitle}>Familien App</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.userInfo}>
            Willkommen, {currentUser.name}
            {currentUser.isAdmin && ' (Admin)'}
          </Text>
          <TouchableOpacity style={styles.headerButton} onPress={toggleDarkMode}>
            <Text style={{ fontSize: 20 }}>{darkMode ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleLogout}>
            <Text style={{ fontSize: 20 }}>🚪</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mainContent}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <ScrollView>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tabButton,
                  activeTab === tab.id ? styles.activeTab : styles.inactiveTab
                ]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Text style={styles.tabIcon}>{tab.icon}</Text>
                <Text style={[
                  styles.tabText,
                  activeTab === tab.id ? styles.activeTabText : styles.inactiveTabText
                ]}>
                  {tab.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <View style={styles.contentCard}>
            {renderContent()}
          </View>
        </View>
      </View>

      {/* Add Item Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {modalType === 'news' && 'Neue Nachricht'}
              {modalType === 'food' && 'Essen bestellen'}
              {modalType === 'shopping' && 'Neuer Artikel'}
              {modalType === 'todo' && 'Neue Aufgabe'}
            </Text>

            {modalType === 'news' && (
              <>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Titel"
                  placeholderTextColor={darkMode ? '#9ca3af' : '#6b7280'}
                  value={modalData.title || ''}
                  onChangeText={(text) => setModalData({...modalData, title: text})}
                />
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea]}
                  placeholder="Nachricht"
                  placeholderTextColor={darkMode ? '#9ca3af' : '#6b7280'}
                  value={modalData.content || ''}
                  onChangeText={(text) => setModalData({...modalData, content: text})}
                  multiline={true}
                />
              </>
            )}

            {(modalType === 'food' || modalType === 'shopping' || modalType === 'todo') && (
              <TextInput
                style={styles.modalInput}
                placeholder={
                  modalType === 'food' ? 'Was möchtest du bestellen?' :
                  modalType === 'shopping' ? 'Artikel' :
                  'Aufgabe'
                }
                placeholderTextColor={darkMode ? '#9ca3af' : '#6b7280'}
                value={modalData.item || modalData.todo || ''}
                onChangeText={(text) => setModalData({
                  ...modalData, 
                  [modalType === 'todo' ? 'todo' : 'item']: text
                })}
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={[styles.modalButtonText, styles.modalCancelText]}>
                  Abbrechen
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={handleAddItem}
              >
                <Text style={[styles.modalButtonText, styles.modalConfirmText]}>
                  Hinzufügen
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default FamilyApp;

// package.json dependencies needed:
/*
{
  "dependencies": {
    "react": "18.2.0",
    "react-native": "0.72.0",
    "@react-native-async-storage/async-storage": "^1.19.0",
    "@supabase/supabase-js": "^2.38.0"
  }
}
*/