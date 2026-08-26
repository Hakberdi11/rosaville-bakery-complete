import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { api, LoyaltySettings, Order } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Gift, Package, User as UserIcon } from 'lucide-react';

export default function Account() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isLoadingAuth, logout, checkUserAuth } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loyaltySettings, setLoyaltySettings] = useState<LoyaltySettings | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [profileForm, setProfileForm] = useState({ full_name: '', phone: '', address: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      navigate('/login');
    }
  }, [isLoadingAuth, isAuthenticated, navigate]);

  const loadOrders = () => api.orders.mine().then(setOrders).catch(() => {});

  useEffect(() => {
    if (!isAuthenticated) return;
    loadOrders();
    api.loyaltySettings.get().then(setLoyaltySettings).catch(() => {});
  }, [isAuthenticated]);

  useEffect(() => {
    if (user) {
      setProfileForm({ full_name: user.full_name || '', phone: user.phone || '', address: user.address || '' });
    }
  }, [user]);

  if (isLoadingAuth || !isAuthenticated || !user) {
    return null;
  }

  const loyalty = user.loyalty;
  const progressInCycle = loyaltySettings && loyalty ? loyalty.order_count % loyaltySettings.purchases_required : 0;

  const handleCancel = async (orderId: number) => {
    setCancellingId(orderId);
    try {
      await api.orders.cancel(orderId);
      toast.success('Order cancelled.');
      await loadOrders();
    } catch {
      toast.error('Could not cancel this order. Please try again.');
    }
    setCancellingId(null);
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await api.auth.updateMe(profileForm);
      await checkUserAuth();
      toast.success('Profile saved.');
    } catch {
      toast.error('Could not save your profile. Please try again.');
    }
    setSavingProfile(false);
  };

  return (
    <div className="w-full bg-background min-h-screen">
      <section className="py-16">
        <div className="container max-w-3xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="font-serif text-4xl font-bold text-foreground">My Account</h1>
              <p className="font-sans text-foreground/70 mt-1">{user.full_name || user.email}</p>
            </div>
            <Button
              onClick={() => logout().then(() => navigate('/'))}
              className="border-2 border-cta bg-white text-foreground hover:bg-muted font-sans font-semibold"
            >
              Log Out
            </Button>
          </div>

          {loyaltySettings?.enabled && loyalty && (
            <div className="bg-white border border-border rounded-lg p-6 mb-8">
              <div className="flex items-center gap-3 mb-3">
                <Gift className="w-6 h-6 text-accent" />
                <h2 className="font-serif text-2xl font-bold text-foreground">Rewards</h2>
              </div>
              {loyalty.reward_available ? (
                <p className="font-sans text-foreground">
                  You have a reward available! Apply it at checkout on your next order.
                </p>
              ) : (
                <p className="font-sans text-foreground/80">
                  {progressInCycle} of {loyaltySettings.purchases_required} purchases toward your next reward
                  {loyaltySettings.reward_type === 'percent_off'
                    ? ` (${loyaltySettings.reward_value}% off)`
                    : ` ($${loyaltySettings.reward_value} off)`}
                  .
                </p>
              )}
            </div>
          )}

          <div className="bg-white border border-border rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <UserIcon className="w-6 h-6 text-accent" />
              <h2 className="font-serif text-2xl font-bold text-foreground">Profile</h2>
            </div>
            <p className="font-sans text-sm text-foreground/60 mb-4">
              Save your phone number and address here — we'll automatically fill them in at checkout next time.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block font-sans font-semibold text-foreground mb-2">Full Name</label>
                <input
                  type="text"
                  value={profileForm.full_name}
                  onChange={(e) => setProfileForm((f) => ({ ...f, full_name: e.target.value }))}
                  className="w-full border border-border rounded px-4 py-2 font-sans focus:outline-none focus:border-cta"
                />
              </div>
              <div>
                <label className="block font-sans font-semibold text-foreground mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full border border-border rounded px-4 py-2 font-sans focus:outline-none focus:border-cta"
                />
              </div>
              <div>
                <label className="block font-sans font-semibold text-foreground mb-2">Address</label>
                <input
                  type="text"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm((f) => ({ ...f, address: e.target.value }))}
                  className="w-full border border-border rounded px-4 py-2 font-sans focus:outline-none focus:border-cta"
                />
              </div>
              <Button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="bg-cta text-white hover:bg-cta-hover font-sans font-semibold"
              >
                {savingProfile ? 'Saving…' : 'Save Profile'}
              </Button>
            </div>
          </div>

          <div className="bg-white border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Package className="w-6 h-6 text-accent" />
              <h2 className="font-serif text-2xl font-bold text-foreground">Order History</h2>
            </div>
            {orders.length === 0 ? (
              <p className="font-sans text-foreground/70">You haven't placed any orders yet.</p>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => {
                  const canCancel = order.status === 'Pending' && order.payment_status === 'Unpaid';
                  return (
                    <div key={order.id} className="pb-6 border-b border-border last:border-0 last:pb-0">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-serif font-semibold text-foreground">{order.order_number}</p>
                          <p className="font-sans text-sm text-foreground/70">
                            {new Date(order.created_at).toLocaleDateString()} · {order.status} · {order.payment_status}
                          </p>
                        </div>
                        <p className="font-serif font-bold text-accent">${order.total_value.toFixed(2)}</p>
                      </div>

                      <div className="bg-muted/40 rounded-lg p-3 mb-3 space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between font-sans text-sm text-foreground/80">
                            <span>
                              {item.name} {item.size ? `(${item.size})` : ''} × {item.quantity}
                            </span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="font-sans text-sm text-foreground/70 space-y-0.5 mb-3">
                        {order.delivery_date && <p>Delivery date: {new Date(order.delivery_date).toLocaleDateString()}</p>}
                        {order.address && <p>Delivery address: {order.address}</p>}
                        {order.phone && <p>Contact phone: {order.phone}</p>}
                      </div>

                      {canCancel ? (
                        <Button
                          onClick={() => handleCancel(order.id)}
                          disabled={cancellingId === order.id}
                          className="border-2 border-destructive bg-white text-destructive hover:bg-destructive/10 font-sans font-semibold text-sm px-4 py-2"
                        >
                          {cancellingId === order.id ? 'Cancelling…' : 'Cancel Order'}
                        </Button>
                      ) : (
                        <p className="font-sans text-xs text-foreground/50 italic">
                          This order can no longer be cancelled — contact us if you need changes.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
