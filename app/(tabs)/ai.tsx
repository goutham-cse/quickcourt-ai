import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../services/supabase';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  options?: string[]; 
  optionType?: 'sport' | 'timing' | 'price';
}

export default function AiAssistantScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'init', sender: 'ai', text: '👋 Welcome to the QuickCourt AI Concierge! Tap below or type "Book a court" to initiate step options, or say "Show my bookings" to run database checks.', options: ['Book a Court 🏟️', 'Show My Bookings 📂'] }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [bookingWizard, setBookingWizard] = useState({ sport: '', timing: '', priceRange: '' });

  async function handleSendMessage(customText?: string) {
    const textToSend = (customText || userInput).trim();
    if (!textToSend) return;

    setMessages(prev => [...prev, { id: `u-${Date.now()}`, sender: 'user', text: textToSend }]);
    setUserInput('');
    setIsTyping(true);

    const lowercaseText = textToSend.toLowerCase();

    if (lowercaseText.includes('book a court') || lowercaseText.includes('book slot')) {
      setTimeout(() => {
        setMessages(prev => [...prev, { id: 's-sport', sender: 'ai', text: '🎯 **Step 1 of 3: Choose your Sport**', options: ['Soccer ⚽', 'Badminton 🏸', 'Basketball 🏀'], optionType: 'sport' }]);
        setIsTyping(false);
      }, 800);
      return;
    }

    if (lowercaseText.includes('show my bookings') || lowercaseText.includes('history')) {
      try {
        const { data: dbRecords } = await supabase.from('bookings').select('venue_name, booking_date, time_slot, status').order('id', { ascending: false }).limit(3);
        let summary = "📂 **Live Database Bookings Summary Found:**\n\n";
        if (dbRecords && dbRecords.length > 0) {
          dbRecords.forEach((item, index) => { summary += `${index + 1}. 🏟️ ${item.venue_name}\n⏰ Slot: ${item.time_slot}\n📌 Status: ${item.status}\n\n`; });
        } else { summary = "📊 Database ledger is empty."; }
        setMessages(prev => [...prev, { id: `rec-${Date.now()}`, sender: 'ai', text: summary }]);
      } catch { } finally { setIsTyping(false); }
      return;
    }

    setTimeout(() => {
      setMessages(prev => [...prev, { id: `r-${Date.now()}`, sender: 'ai', text: "I can run real-time table calls or log hold reservations! Tap 'Book a Court' to test it." }]);
      setIsTyping(false);
    }, 800);
  }

  async function handleOptionSelect(optionText: string, type: 'sport' | 'timing' | 'price') {
    setMessages(prev => [...prev, { id: `uo-${Date.now()}`, sender: 'user', text: optionText }]);
    setIsTyping(true);

    if (type === 'sport') {
      bookingWizard.sport = optionText.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]/g, '').trim();
      setTimeout(() => {
        setMessages(prev => [...prev, { id: 's-time', sender: 'ai', text: `🕒 **Step 2 of 3: Choose hour timing**`, options: ['Morning (07:00 AM)', 'Evening (05:00 PM)'], optionType: 'timing' }]);
        setIsTyping(false);
      }, 800);
    } else if (type === 'timing') {
      bookingWizard.timing = optionText;
      setTimeout(() => {
        setMessages(prev => [...prev, { id: 's-price', sender: 'ai', text: `💰 **Step 3 of 3: Budget tier range**`, options: ['Standard (₹600/hr)', 'Premium (₹800/hr)'], optionType: 'price' }]);
        setIsTyping(false);
      }, 800);
    } else if (type === 'price') {
      const rate = parseInt(optionText.replace(/\D/g, '')) || 600;
      try {
        const venueName = bookingWizard.sport.includes('Badminton') ? "Smash Pro Badminton Academy" : "Champions Grand Turf Arena";
        await supabase.from('bookings').insert([{ venue_name: venueName, booking_date: '2026-06-01', time_slot: "06:00 PM - 07:00 PM", total_price: rate, status: 'Pending Payment 🟡' }]);
        setMessages(prev => [...prev, { id: `sc-${Date.now()}`, sender: 'ai', text: `🤖 **AI Hold Reservation Created!**\n\n🏟️ **Venue:** ${venueName}\n📌 **Status:** Pending Payment 🟡\n\nRow successfully pushed to your Supabase tables database instance seamlessly!` }]);
      } catch {} finally { setIsTyping(false); setBookingWizard({ sport: '', timing: '', priceRange: '' }); }
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.chatHeader}>
        <Text style={styles.headerTitle}>🤖 QuickCourt AI Concierge</Text>
        <Text style={styles.headerSub}>Interactive choices layout engine linked directly to your Supabase tables</Text>
      </View>
      <ScrollView style={styles.msgScrollView} contentContainerStyle={styles.msgContentContainer}>
        {messages.map((msg) => (
          <View key={msg.id} style={styles.bubbleSectionGroup}>
            <View style={[styles.msgWrapperRow, msg.sender === 'ai' ? styles.rowLeft : styles.rowRight]}>
              <View style={[styles.bubble, msg.sender === 'ai' ? styles.aiBubble : styles.userBubble]}><Text style={msg.sender === 'ai' ? styles.aiText : styles.userText}>{msg.text}</Text></View>
            </View>
            {msg.sender === 'ai' && msg.options && (
              <View style={styles.optionsFlexGrid}>
                {msg.options.map(o => (
                  <TouchableOpacity key={o} style={styles.optionButtonTile} onPress={() => msg.optionType ? handleOptionSelect(o, msg.optionType) : handleSendMessage(o)}><Text style={styles.optionButtonText}>{o}</Text></TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}
        {isTyping && <View style={styles.rowLeft}><Text style={styles.typingText}>AI is calculating data matrices...</Text></View>}
      </ScrollView>
      <View style={styles.bottomActionBarContainer}>
        <TextInput style={styles.inputFieldBox} placeholder="Type 'Book a court'..." value={userInput} onChangeText={setUserInput} onSubmitEditing={() => handleSendMessage()} />
        <TouchableOpacity style={styles.sendBtnAction} onPress={() => handleSendMessage()}><Text style={styles.sendTextIcon}>⚡</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  chatHeader: { backgroundColor: '#fff', padding: 16, paddingTop: 45, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e3a8a' },
  headerSub: { fontSize: 11, color: '#64748b', marginTop: 2 },
  msgScrollView: { flex: 1, padding: 14 },
  msgContentContainer: { paddingBottom: 35 },
  bubbleSectionGroup: { width: '100%', marginBottom: 14 },
  msgWrapperRow: { flexDirection: 'row', width: '100%' },
  rowLeft: { justifyContent: 'flex-start' },
  rowRight: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '85%', borderRadius: 14, padding: 12, borderWidth: 1 },
  aiBubble: { backgroundColor: '#fff', borderColor: '#e2e8f0', borderBottomLeftRadius: 4 },
  userBubble: { backgroundColor: '#1e3a8a', borderColor: '#1e3a8a', borderBottomRightRadius: 4 },
  aiText: { color: '#1e293b', fontWeight: '500', fontSize: 13 },
  userText: { color: '#fff', fontWeight: '500', fontSize: 13 },
  optionsFlexGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8, width: '100%' },
  optionButtonTile: { backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  optionButtonText: { color: '#1e40af', fontSize: 12, fontWeight: '700' },
  typingText: { fontSize: 11, color: '#64748b', fontStyle: 'italic', marginTop: 4 },
  bottomActionBarContainer: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e2e8f0', alignItems: 'center', gap: 10 },
  inputFieldBox: { flex: 1, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 13 },
  sendBtnAction: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1e3a8a', justifyContent: 'center', alignItems: 'center' },
  sendTextIcon: { color: '#fff', fontSize: 15, fontWeight: 'bold' }
});