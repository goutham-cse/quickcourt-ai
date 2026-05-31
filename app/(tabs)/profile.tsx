import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../services/supabase';

export default function AdvancedProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  
  const [userEmail, setUserEmail] = useState('player@quickcourt.ai');
  const [userNickname, setUserNickname] = useState('Pro Player');
  const [playerMobile, setPlayerMobile] = useState('+91 9876543210');
  const [preferredSport, setPreferredSport] = useState('Football');
  
  const [totalBookingsCount, setTotalBookingsCount] = useState(0);
  const [totalAmountSpent, setTotalAmountSpent] = useState(0);
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState(0);

  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  useEffect(() => { syncProfileDashboardMetrics(); }, []);

  async function syncProfileDashboardMetrics() {
    try {
      setSyncing(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserEmail(session.user.email || 'player@quickcourt.ai');
        const prefix = session.user.email ? session.user.email.split('@')[0] : 'Pro Player';
        setUserNickname(prefix.charAt(0).toUpperCase() + prefix.slice(1));
      }

      const { data: records, error } = await supabase.from('bookings').select('total_price, status');
      if (!error && records) {
        setTotalBookingsCount(records.length);
        let cash = 0, pending = 0;
        (records as any[]).forEach((b) => {
          cash += (b.total_price || 0);
          if (b.status && b.status.toLowerCase().includes('pending')) pending++;
        });
        setTotalAmountSpent(cash);
        setPendingPaymentsCount(pending);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); setSyncing(false); }
  }

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#1e3a8a" /></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.profileHeroCard}>
        <View style={styles.avatarPlaceholderCircle}>
          <Text style={styles.avatarInitialsText}>{userNickname.substring(0, 2).toUpperCase()}</Text>
          <View style={styles.onlineIndicatorDot} />
        </View>
        <Text style={styles.userDisplayNameText}>{userNickname}</Text>
        <Text style={styles.userEmailSubtext}>✉️ {userEmail}</Text>
        <View style={styles.membershipTierBadgeRow}><Text style={styles.tierBadgeText}>⚡ ELITE LEVEL MEMBER</Text></View>
      </View>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.blockSectionHeaderTitle}>📊 Real-Time Match Analytics</Text>
        {syncing && <ActivityIndicator size="small" color="#1e3a8a" />}
      </View>
      
      <View style={styles.metricsGridContainer}>
        <View style={styles.metricItemBox}><Text style={styles.metricIconGraphic}>🏟️</Text><Text style={styles.metricValueCounterText}>{totalBookingsCount}</Text><Text style={styles.metricLabelCaptionText}>Bookings</Text></View>
        <View style={styles.metricItemBox}><Text style={styles.metricIconGraphic}>💰</Text><Text style={styles.metricValueCounterText} numberOfLines={1}>₹{totalAmountSpent}</Text><Text style={styles.metricLabelCaptionText}>Value Spent</Text></View>
        <View style={styles.metricItemBox}><Text style={styles.metricIconGraphic}>🟡</Text><Text style={[styles.metricValueCounterText, pendingPaymentsCount > 0 && { color: '#b45309' }]}>{pendingPaymentsCount}</Text><Text style={styles.metricLabelCaptionText}>Pending</Text></View>
      </View>

      <Text style={styles.blockSectionHeaderTitle}>⚙️ Quick Actions & Operations</Text>
      <View style={styles.settingsMenuContainerBlock}>
        <TouchableOpacity style={styles.menuRowItemBtn} onPress={() => setShowEditProfileModal(true)}><View style={styles.menuLeftInfoGroup}><Text style={styles.menuIconField}>👤</Text><Text style={styles.menuLabelText}>Player Preferences</Text></View><Text style={styles.menuChevronArrowIcon}>➔</Text></TouchableOpacity>
        <TouchableOpacity style={styles.menuRowItemBtn} onPress={() => setShowWalletModal(true)}><View style={styles.menuLeftInfoGroup}><Text style={styles.menuIconField}>💳</Text><Text style={styles.menuLabelText}>Saved Gateways</Text></View><Text style={styles.menuChevronArrowIcon}>➔</Text></TouchableOpacity>
        <TouchableOpacity style={styles.menuRowItemBtn} onPress={() => setShowNotificationModal(true)}><View style={styles.menuLeftInfoGroup}><Text style={styles.menuIconField}>🔔</Text><Text style={styles.menuLabelText}>Alert Configurations</Text></View><Text style={styles.menuChevronArrowIcon}>➔</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.menuRowItemBtn, { borderBottomWidth: 0 }]} onPress={syncProfileDashboardMetrics} disabled={syncing}><View style={styles.menuLeftInfoGroup}><Text style={styles.menuIconField}>🔄</Text><Text style={[styles.menuLabelText, { color: '#2563eb', fontWeight: 'bold' }]}>{syncing ? 'Syncing...' : 'Sync Database Ledger'}</Text></View><Text style={styles.menuChevronArrowIcon}>➔</Text></TouchableOpacity>
      </View>

      <Modal visible={showEditProfileModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}><Text style={styles.modalTitle}>👤 Profile Edit</Text><TouchableOpacity onPress={() => setShowEditProfileModal(false)}><Text style={styles.closeIcon}>✕</Text></TouchableOpacity></View>
            <View style={styles.formFieldGroup}><Text style={styles.fieldLabel}>Full Name</Text><TextInput style={styles.textInput} value={userNickname} onChangeText={setUserNickname} /></View>
            <View style={styles.formFieldGroup}><Text style={styles.fieldLabel}>Mobile</Text><TextInput style={styles.textInput} value={playerMobile} onChangeText={setPlayerMobile} keyboardType="phone-pad" /></View>
            <View style={styles.formFieldGroup}><Text style={styles.fieldLabel}>Preferred Sport</Text><TextInput style={styles.textInput} value={preferredSport} onChangeText={setPreferredSport} /></View>
            <TouchableOpacity style={styles.modalSaveBtn} onPress={() => { window.alert('Profile Saved!'); setShowEditProfileModal(false); }}><Text style={styles.closeBtnText}>Save Settings ✓</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showWalletModal} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>💳 Razorpay Balance</Text>
            <View style={styles.walletBalanceRow}><Text style={styles.walletLabel}>Sandbox Balance:</Text><Text style={styles.walletValue}>₹2,500.00</Text></View>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowWalletModal(false)}><Text style={styles.closeBtnText}>Close</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showNotificationModal} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>🔔 Notifications</Text>
            <Text style={styles.bulletItem}>• Push Confirmations: **Enabled**</Text>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowNotificationModal(false)}><Text style={styles.closeBtnText}>Dismiss</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 16, paddingTop: 45, paddingBottom: 60 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  closeIcon: { fontSize: 16, color: '#94a3b8', fontWeight: 'bold' },
  profileHeroCard: { backgroundColor: '#fff', padding: 24, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20 },
  avatarPlaceholderCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1e3a8a', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarInitialsText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  onlineIndicatorDot: { position: 'absolute', bottom: 2, right: 4, width: 14, height: 14, borderRadius: 7, backgroundColor: '#10b981', borderWidth: 2, borderColor: '#fff' },
  userDisplayNameText: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  userEmailSubtext: { fontSize: 12, color: '#64748b', marginTop: 2, marginBottom: 12 },
  membershipTierBadgeRow: { backgroundColor: '#eff6ff', borderColor: '#bfdbfe', borderWidth: 1, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  tierBadgeText: { fontSize: 10, fontWeight: '800', color: '#1e40af' },
  blockSectionHeaderTitle: { fontSize: 13, fontWeight: 'bold', color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, paddingLeft: 2 },
  metricsGridContainer: { flexDirection: 'row', gap: 8, marginBottom: 24, width: '100%' },
  metricItemBox: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', minWidth: 0 },
  metricIconGraphic: { fontSize: 18, marginBottom: 4 },
  metricValueCounterText: { fontSize: 15, fontWeight: 'bold', color: '#0f172a' },
  metricLabelCaptionText: { fontSize: 10, color: '#64748b', fontWeight: '600', marginTop: 2, textAlign: 'center' },
  settingsMenuContainerBlock: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden' },
  menuRowItemBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  menuLeftInfoGroup: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuIconField: { fontSize: 16 },
  menuLabelText: { fontSize: 13, fontWeight: '600', color: '#334155' },
  menuChevronArrowIcon: { fontSize: 11, color: '#94a3b8' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalCard: { backgroundColor: '#fff', width: '100%', maxWidth: 360, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#cbd5e1' },
  modalTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e3a8a' },
  modalBody: { fontSize: 13, color: '#475569', lineHeight: 18, marginBottom: 14 },
  formFieldGroup: { marginBottom: 12, width: '100%' },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: '#475569', marginBottom: 4 },
  textInput: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 10, fontSize: 13, color: '#1e293b', width: '100%' },
  walletBalanceRow: { backgroundColor: '#f1f5f9', borderRadius: 8, padding: 12, marginBottom: 16 },
  walletLabel: { fontSize: 11, color: '#64748b', fontWeight: '600' },
  walletValue: { fontSize: 20, fontWeight: 'bold', color: '#10b981', marginTop: 2 },
  bulletItem: { fontSize: 12, color: '#334155', marginBottom: 6 },
  modalCloseBtn: { backgroundColor: '#64748b', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10, width: '100%' },
  modalSaveBtn: { backgroundColor: '#1e3a8a', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 14, width: '100%' },
  closeBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 }
});