import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../services/supabase';

const AVAILABLE_HOURS = ['06:00 AM - 07:00 AM', '07:00 AM - 08:00 AM', '04:00 PM - 05:00 PM', '05:00 PM - 06:00 PM', '06:00 PM - 07:00 PM', '07:00 PM - 08:00 PM', '08:00 PM - 09:00 PM'];
const PAYMENT_QR = require('../../assets/images/payment-qr.jpeg');

interface BookingRecord { id: number; venue_name: string; booking_date: string; time_slot: string; total_price: number; status: string; }
interface VenueReview { id: number; player_name: string; rating: number; comment: string; }

export default function VenueBookingScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');

  const [bookingHistory, setBookingHistory] = useState<BookingRecord[]>([]);
  const [playerReviews, setPlayerReviews] = useState<VenueReview[]>([]);

  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [turfFeedbackInput, setTurfFeedbackInput] = useState('');
  const [isSendingReview, setIsSendingReview] = useState(false);

  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [splitCount, setSplitCount] = useState('1'); 

  const targetVenueId = id as string;
  const isBadminton = targetVenueId && targetVenueId.includes('turf-2');
  const isBasketball = targetVenueId && targetVenueId.includes('turf-3');
  const isTennis = targetVenueId && targetVenueId.includes('turf-4');

  let VENUE_NAME = "Champions Grand Turf Arena";
  let PRICE_PER_HOUR = 600;

  if (isBadminton) { VENUE_NAME = "Smash Pro Badminton Academy"; PRICE_PER_HOUR = 400; }
  else if (isBasketball) { VENUE_NAME = "Skyline Basketball Court"; PRICE_PER_HOUR = 750; }
  else if (isTennis) { VENUE_NAME = "Grand Slam Tennis Greens"; PRICE_PER_HOUR = 900; }

  const parsedSplits = Math.max(parseInt(splitCount) || 1, 1);
  const perPlayerCost = Math.round(PRICE_PER_HOUR / parsedSplits);

  useEffect(() => { syncCompleteEngineState(); }, [id]);

  async function syncCompleteEngineState() {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUserId(session?.user?.id || null);
      setCurrentUserEmail(session?.user?.email || 'player@quickcourt.ai');

      const { data: records } = await supabase.from('bookings').select('*').order('id', { ascending: false });
      if (records) setBookingHistory(records);

      const { data: reviews } = await supabase.from('venue_reviews').select('*').eq('venue_id', targetVenueId).order('id', { ascending: false });
      if (reviews) setPlayerReviews(reviews);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  function closeRazorpayModal() {
    setShowRazorpayModal(false);
    setSelectedPaymentMethod(null);
  }

  async function handleSimulatedPaymentSuccess(methodName: string) {
    try {
      setProcessingPayment(true);
      await new Promise(res => setTimeout(res, 1800));

      const { error } = await supabase.from('bookings').insert([{ venue_name: VENUE_NAME, booking_date: '2026-06-01', time_slot: selectedSlot, total_price: PRICE_PER_HOUR, status: `Paid via Razorpay (${methodName})` }]);
      if (error) throw error;

      Alert.alert('Booking Secured', 'Payment verified through Razorpay mock checkout.');
      setShowRazorpayModal(false);
      setSelectedPaymentMethod(null);
      setSelectedSlot(null);
      setSplitCount('1');
      syncCompleteEngineState();
    } catch (err: any) {
      Alert.alert('Payment failed', err.message || 'Unable to confirm this payment.');
    } finally {
      setProcessingPayment(false);
    }
  }
  async function handlePublishTurfReview() {
    if (!turfFeedbackInput.trim()) return;
    try {
      setIsSendingReview(true);
      await supabase.from('venue_reviews').insert([{ venue_id: targetVenueId, player_name: currentUserEmail.split('@')[0], rating: 5, comment: turfFeedbackInput.trim() }]);
      setTurfFeedbackInput(''); window.alert('Review Logged!'); syncCompleteEngineState();
    } catch (err) { console.error(err); } finally { setIsSendingReview(false); }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.cardHeader}>
        <TouchableOpacity onPress={() => router.replace('/venues')} style={styles.backLink}><Text style={styles.backLinkText}>← Return to Exploration Dashboard</Text></TouchableOpacity>
        <Text style={styles.mainTitle}>{VENUE_NAME}</Text>
        <Text style={styles.subLabel}>🏟️ Active Premium Arena Complex  •  Rate: ₹{PRICE_PER_HOUR}/hr</Text>
      </View>

      <View style={styles.blockCard}>
        <Text style={styles.blockHeader}>Select Hourly Time Slot</Text>
        <View style={styles.slotsGridContainer}>
          {AVAILABLE_HOURS.map((s) => (
            <TouchableOpacity key={s} style={[styles.slotItem, selectedSlot === s && styles.activeSlotItem]} onPress={() => setSelectedSlot(s)}><Text style={[styles.slotText, selectedSlot === s && styles.activeSlotText]}>{s}</Text></TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={[styles.confirmActionBtn, !selectedSlot && styles.disabledBtn]} onPress={() => selectedSlot ? setShowRazorpayModal(true) : null} disabled={!selectedSlot}><Text style={styles.btnTextText}>Pay with Razorpay 💳</Text></TouchableOpacity>
      </View>

      <Modal visible={showRazorpayModal} animationType="slide" transparent={true}>
        <View style={styles.modalBlurOverlay}>
          {processingPayment ? (
            <View style={styles.razorpayLoaderBox}><ActivityIndicator size="large" color="#3399cc" /><Text style={styles.razorpayLoaderText}>Processing secure gateway payment...</Text></View>
          ) : (
            <View style={styles.razorpaySheet}>
              <View style={styles.razorpayHeader}>
                <View>
                  <Text style={styles.razorpayBrand}>Razorpay</Text>
                  <Text style={styles.razorpayMerchant}>{VENUE_NAME}</Text>
                </View>
                <TouchableOpacity onPress={closeRazorpayModal}><Text style={styles.razorpayClose}>x</Text></TouchableOpacity>
              </View>

              {selectedPaymentMethod ? (
                <View style={styles.qrCheckoutPanel}>
                  <View style={styles.qrStatusPill}><Text style={styles.qrStatusText}>Secure Razorpay UPI Intent</Text></View>
                  <View style={styles.qrAmountBox}>
                    <Text style={styles.qrAmountLabel}>Amount payable</Text>
                    <Text style={styles.qrAmountValue}>Rs. {perPlayerCost}</Text>
                    <Text style={styles.qrAmountMeta}>{selectedPaymentMethod}  |  Split {parsedSplits} player{parsedSplits > 1 ? 's' : ''}</Text>
                  </View>
                  <View style={styles.qrFrame}>
                    <View style={styles.qrCornerTopLeft} />
                    <View style={styles.qrCornerTopRight} />
                    <Image source={PAYMENT_QR} style={styles.qrImage} resizeMode="contain" />
                    <View style={styles.qrCornerBottomLeft} />
                    <View style={styles.qrCornerBottomRight} />
                  </View>
                  <Text style={styles.qrInstruction}>Scan this QR with any UPI app. After the transaction succeeds, tap Payment Done to confirm your booking.</Text>
                  <View style={styles.qrActionRow}>
                    <TouchableOpacity style={styles.secondaryPaymentBtn} onPress={() => setSelectedPaymentMethod(null)}>
                      <Text style={styles.secondaryPaymentText}>Change Method</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.primaryPaymentBtn} onPress={() => handleSimulatedPaymentSuccess(selectedPaymentMethod)}>
                      <Text style={styles.primaryPaymentText}>Payment Done</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <>
                  <View style={styles.splitBoxInline}>
                    <Text style={styles.splitLabel}>Split Players Count:</Text>
                    <TextInput style={styles.splitInputInline} value={splitCount} onChangeText={setSplitCount} keyboardType="numeric" />
                    <Text style={styles.splitCostDisplay}>Your Share: Rs. {perPlayerCost}</Text>
                  </View>
                  <View style={styles.gatewayFrame}>
                    <Text style={styles.gatewayTitle}>Choose Razorpay payment method</Text>
                    <Text style={styles.gatewaySubtitle}>A secure QR checkout will open for confirmation.</Text>
                    <TouchableOpacity style={styles.methodRow} onPress={() => setSelectedPaymentMethod('UPI / GPay')}><Text style={styles.methodTitle}>UPI - Google Pay / PhonePe</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.methodRow} onPress={() => setSelectedPaymentMethod('Card')}><Text style={styles.methodTitle}>Credit / Debit Card</Text></TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          )}
        </View>
      </Modal>

      <View style={styles.blockCard}>
        <Text style={styles.blockHeader}>Player Feedback Ledger</Text>
        {playerReviews.map(r => (
          <View key={r.id} style={styles.reviewBubbleItem}><Text style={styles.reviewerName}>👤 {r.player_name} (★ {r.rating}/5)</Text><Text style={styles.reviewComment}>{`"${r.comment}"`}</Text></View>
        ))}
      </View>

      <View style={styles.blockCard}>
        <TextInput style={styles.multiLineInputField} placeholder="Write turf feedback..." value={turfFeedbackInput} onChangeText={setTurfFeedbackInput} multiline />
        <TouchableOpacity style={styles.submitFeedbackBtn} onPress={handlePublishTurfReview} disabled={isSendingReview}><Text style={styles.btnTextText}>Submit Feedback entry 📣</Text></TouchableOpacity>
      </View>

      <View style={styles.blockCard}>
        <Text style={styles.blockHeader}>Your Lifetime Reservations History Ledger</Text>
        {bookingHistory.map(b => (
          <View key={b.id} style={styles.historyCardLogBox}>
            <Text style={styles.historyTitleText}>{b.venue_name} (<Text style={{color:'#15803d'}}>{b.status}</Text>)</Text>
            <Text style={styles.historyBodyText}>📅 Schedule Date: {b.booking_date} • ⏰ Hours: {b.time_slot}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 16, paddingTop: 40, paddingBottom: 60 },
  cardHeader: { backgroundColor: '#fff', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 14 },
  backLink: { marginBottom: 10, paddingVertical: 4 },
  backLinkText: { color: '#2563eb', fontSize: 13, fontWeight: '600' },
  mainTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  subLabel: { fontSize: 13, color: '#475569', marginTop: 3 },
  blockCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 14 },
  blockHeader: { fontSize: 15, fontWeight: 'bold', color: '#1e3a8a', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 8, marginBottom: 12 },
  slotsGridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  slotItem: { flexGrow: 1, flexShrink: 0, flexBasis: '45%', backgroundColor: '#f1f5f9', padding: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#cbd5e1' },
  activeSlotItem: { backgroundColor: '#1e3a8a', borderColor: '#1e3a8a' },
  slotText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  activeSlotText: { color: '#fff' },
  confirmActionBtn: { backgroundColor: '#3399cc', padding: 14, borderRadius: 8, alignItems: 'center' },
  disabledBtn: { backgroundColor: '#94a3b8' },
  btnTextText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  modalBlurOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end', alignItems: 'center' },
  razorpaySheet: { backgroundColor: '#fff', width: '100%', maxWidth: 500, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20 },
  razorpayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 14, marginBottom: 14 },
  razorpayBrand: { fontSize: 16, fontWeight: 'bold', color: '#3399cc' },
  razorpayMerchant: { fontSize: 13, color: '#475569', marginTop: 1 },
  razorpayClose: { fontSize: 18, color: '#94a3b8', fontWeight: 'bold' },
  splitBoxInline: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 14 },
  splitLabel: { fontSize: 12, color: '#475569', fontWeight: '600' },
  splitInputInline: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, padding: 4, width: 45, fontSize: 12, textAlign: 'center' },
  splitCostDisplay: { fontSize: 12, color: '#059669', marginLeft: 'auto', fontWeight: '700' },
  gatewayFrame: { backgroundColor: '#f8fbff', borderWidth: 1, borderColor: '#bfdbfe', borderRadius: 12, padding: 12 },
  gatewayTitle: { fontSize: 14, fontWeight: '800', color: '#0f172a', marginBottom: 3 },
  gatewaySubtitle: { fontSize: 12, color: '#64748b', marginBottom: 12 },
  methodRow: { padding: 14, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, marginBottom: 10 },
  methodTitle: { fontSize: 13, fontWeight: '700', color: '#1e293b' },
  qrCheckoutPanel: { backgroundColor: '#f8fbff', borderWidth: 1, borderColor: '#bfdbfe', borderRadius: 14, padding: 14, alignItems: 'center' },
  qrStatusPill: { backgroundColor: '#e0f2fe', borderWidth: 1, borderColor: '#7dd3fc', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, marginBottom: 12 },
  qrStatusText: { color: '#0369a1', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  qrAmountBox: { width: '100%', backgroundColor: '#0f172a', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 14 },
  qrAmountLabel: { color: '#cbd5e1', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  qrAmountValue: { color: '#ffffff', fontSize: 28, fontWeight: '900', marginTop: 2 },
  qrAmountMeta: { color: '#93c5fd', fontSize: 12, marginTop: 3, fontWeight: '600' },
  qrFrame: { width: '86%', maxWidth: 300, aspectRatio: 1, backgroundColor: '#ffffff', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#dbeafe', shadowColor: '#0f172a', shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 6, position: 'relative', marginBottom: 14 },
  qrImage: { width: '100%', height: '100%', borderRadius: 8 },
  qrCornerTopLeft: { position: 'absolute', top: 8, left: 8, width: 28, height: 28, borderTopWidth: 3, borderLeftWidth: 3, borderColor: '#3399cc', borderTopLeftRadius: 10, zIndex: 1 },
  qrCornerTopRight: { position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderTopWidth: 3, borderRightWidth: 3, borderColor: '#3399cc', borderTopRightRadius: 10, zIndex: 1 },
  qrCornerBottomLeft: { position: 'absolute', bottom: 8, left: 8, width: 28, height: 28, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: '#3399cc', borderBottomLeftRadius: 10, zIndex: 1 },
  qrCornerBottomRight: { position: 'absolute', bottom: 8, right: 8, width: 28, height: 28, borderBottomWidth: 3, borderRightWidth: 3, borderColor: '#3399cc', borderBottomRightRadius: 10, zIndex: 1 },
  qrInstruction: { fontSize: 12, color: '#475569', textAlign: 'center', lineHeight: 17, marginBottom: 14 },
  qrActionRow: { flexDirection: 'row', gap: 10, width: '100%' },
  secondaryPaymentBtn: { flex: 1, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, paddingVertical: 12, alignItems: 'center', backgroundColor: '#ffffff' },
  secondaryPaymentText: { color: '#334155', fontSize: 12, fontWeight: '800' },
  primaryPaymentBtn: { flex: 1, backgroundColor: '#3399cc', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  primaryPaymentText: { color: '#ffffff', fontSize: 12, fontWeight: '900' },
  razorpayLoaderBox: { backgroundColor: '#fff', padding: 30, borderRadius: 12, alignItems: 'center', width: '90%' },
  razorpayLoaderText: { fontSize: 13, fontWeight: 'bold', color: '#1e293b', marginTop: 14 },
  reviewBubbleItem: { backgroundColor: '#f8fafc', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 10 },
  reviewerName: { fontSize: 13, fontWeight: '700', color: '#334155' },
  reviewComment: { fontSize: 13, color: '#475569', fontStyle: 'italic', marginTop: 2 },
  multiLineInputField: { backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 12, fontSize: 14, color: '#1e293b', height: 70, marginBottom: 12, width: '100%' },
  submitFeedbackBtn: { backgroundColor: '#1e3a8a', padding: 12, borderRadius: 8, alignItems: 'center' },
  historyCardLogBox: { backgroundColor: '#f8fafc', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#e2e8f0', marginTop: 10 },
  historyTitleText: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  historyBodyText: { fontSize: 12, color: '#475569', marginTop: 2 }
});
