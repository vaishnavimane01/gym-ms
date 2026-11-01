import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import Modal from '../../components/Modal';
import { toast } from '../../components/Toast';
import {
  CreditCard,
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  User,
  Package,
  Receipt,
  Wallet
} from 'lucide-react';

export default function POS() {
  const [members, setMembers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Cart state: array of { product, quantity }
  const [cart, setCart] = useState([]);
  const [checkingOut, setCheckingOut] = useState(false);

  // Success Receipt Modal
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [mRes, pRes] = await Promise.all([
          api.get('/members/'),
          api.get('/products/'),
        ]);
        setMembers(mRes.data || []);
        setProducts(pRes.data || []);
      } catch (err) {
        toast('Failed to load POS data', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const selectedMember = members.find((m) => m.id === parseInt(selectedMemberId, 10));

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCat = !selectedCategory || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const categories = ['All', ...new Set(products.map((p) => p.category))];

  const addToCart = (product) => {
    if (product.stock_quantity <= 0) {
      toast(`'${product.name}' is out of stock`, 'warning');
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock_quantity) {
          toast(`Cannot exceed available stock (${product.stock_quantity})`, 'warning');
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.product.stock_quantity) {
              toast(`Max available stock is ${item.product.stock_quantity}`, 'warning');
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const memberWallet = selectedMember ? Number(selectedMember.wallet_balance) : 0;
  const isInsufficientFunds = selectedMember && memberWallet < subtotal;

  const handleCheckout = async () => {
    if (!selectedMemberId) {
      toast('Please select a member for checkout', 'warning');
      return;
    }
    if (cart.length === 0) {
      toast('Cart is empty', 'warning');
      return;
    }
    if (isInsufficientFunds) {
      toast(
        `Insufficient balance! Member needs ₹${(subtotal - memberWallet).toFixed(2)} more`,
        'error'
      );
      return;
    }

    try {
      setCheckingOut(true);
      const payload = {
        member_id: parseInt(selectedMemberId, 10),
        items: cart.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
      };

      const res = await api.post('/products/checkout', payload);
      const data = res.data;

      setReceiptData({
        ...data,
        memberName: selectedMember.full_name,
        timestamp: new Date().toLocaleString(),
      });
      setReceiptOpen(true);
      toast('Transaction completed successfully!', 'success');

      // Update local member wallet and product stock
      setMembers((prev) =>
        prev.map((m) =>
          m.id === selectedMember.id ? { ...m, wallet_balance: data.new_wallet_balance } : m
        )
      );
      // Re-fetch products to get updated stock
      const pRes = await api.get('/products/');
      setProducts(pRes.data || []);
      clearCart();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Checkout failed';
      toast(typeof msg === 'string' ? msg : JSON.stringify(msg), 'error');
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) {
    return <Spinner className="py-20" size="lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Point of Sale (POS)</h1>
        <p className="text-sm text-slate-500">Atomic inventory sales directly billed to member wallets.</p>
      </div>

      {/* POS Screen: Split into Product Catalog and Cart Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Member Selector & Product Catalog (2 cols on lg) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Member Selector Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                Select Member Account:
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="">-- Choose Member --</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name} ({m.phone}) — Wallet: ₹{Number(m.wallet_balance).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedMember && (
              <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-right shrink-0">
                <p className="text-xs text-emerald-700 font-semibold uppercase">Wallet Balance</p>
                <p className="text-lg font-extrabold text-emerald-900">
                  ₹{Number(selectedMember.wallet_balance).toFixed(2)}
                </p>
              </div>
            )}
          </div>

          {/* Search & Categories */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products by title..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {categories.map((cat) => {
                const isActive = (selectedCategory === '' && cat === 'All') || selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat === 'All' ? '' : cat)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Items Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredProducts.map((p) => {
              const inStock = p.stock_quantity > 0;
              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-2xl border bg-white shadow-sm flex flex-col justify-between transition-all ${
                    inStock ? 'hover:shadow-md' : 'opacity-60 bg-slate-50'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {p.category}
                    </span>
                    <h3 className="font-semibold text-slate-900 text-sm mt-0.5 line-clamp-1">{p.name}</h3>
                    <p className="text-emerald-700 font-extrabold text-base mt-2">
                      ₹{Number(p.price).toFixed(2)}
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span
                      className={`text-[11px] font-medium ${
                        p.stock_quantity <= 5 ? 'text-amber-600 font-bold' : 'text-slate-500'
                      }`}
                    >
                      {inStock ? `${p.stock_quantity} in stock` : 'Out of stock'}
                    </span>
                    <button
                      onClick={() => addToCart(p)}
                      disabled={!inStock}
                      className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 disabled:opacity-40 disabled:hover:bg-emerald-50 transition-colors"
                      title="Add to Cart"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Checkout Cart Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col h-full min-h-[500px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-slate-900">Current Order</h2>
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-rose-500 hover:text-rose-700 font-medium"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto py-3 space-y-2">
            {cart.length === 0 ? (
              <div className="py-20 text-center">
                <ShoppingCart className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">Cart is currently empty</p>
                <p className="text-slate-400 text-xs mt-1">Select items on the left to add</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">{item.product.name}</p>
                    <p className="text-[11px] text-slate-500">
                      ₹{item.product.price} × {item.quantity} = ₹{(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="w-6 h-6 rounded-md text-rose-500 hover:bg-rose-50 flex items-center justify-center ml-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary Calculation */}
          <div className="pt-4 border-t border-slate-200 space-y-2">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Items Total ({cart.reduce((a, b) => a + b.quantity, 0)})</span>
              <span className="font-semibold text-slate-900">₹{subtotal.toFixed(2)}</span>
            </div>

            {selectedMember && (
              <div className="flex justify-between text-xs text-slate-500">
                <span>Wallet Available</span>
                <span className="font-medium text-slate-700">₹{memberWallet.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-100">
              <span>Amount Due</span>
              <span className="text-emerald-700 text-lg">₹{subtotal.toFixed(2)}</span>
            </div>

            {/* Fund warning */}
            {isInsufficientFunds && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  Short by ₹{(subtotal - memberWallet).toFixed(2)}. Adjust member wallet before checkout.
                </span>
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={checkingOut || cart.length === 0 || !selectedMemberId || isInsufficientFunds}
              className="w-full mt-3 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
            >
              <CreditCard className="w-5 h-5" />
              {checkingOut ? 'Debiting Wallet...' : 'Execute Atomic Checkout'}
            </button>
          </div>
        </div>
      </div>

      {/* SUCCESS RECEIPT MODAL */}
      <Modal open={receiptOpen} onClose={() => setReceiptOpen(false)} title="Checkout Receipt">
        {receiptData && (
          <div className="space-y-4">
            <div className="text-center py-2">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Payment Successful</h3>
              <p className="text-xs text-slate-400">{receiptData.timestamp}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Member Name:</span>
                <span className="font-semibold text-slate-900">{receiptData.memberName}</span>
              </div>
              <div className="flex justify-between">
                <span>Member ID:</span>
                <span className="font-semibold text-slate-900">#{receiptData.member_id}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="font-semibold text-emerald-700">Gym Member Wallet</span>
              </div>
            </div>

            {/* Items table */}
            <div className="border border-slate-100 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold">
                  <tr>
                    <th className="p-2">Item</th>
                    <th className="p-2 text-center">Qty</th>
                    <th className="p-2 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {receiptData.items_purchased?.map((it, i) => (
                    <tr key={i}>
                      <td className="p-2 font-medium text-slate-800">{it.product_name}</td>
                      <td className="p-2 text-center text-slate-600">{it.quantity}</td>
                      <td className="p-2 text-right font-semibold text-slate-900">₹{it.line_total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between font-bold text-slate-900 text-sm">
                <span>Total Debited:</span>
                <span>₹{Number(receiptData.total_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-800">
                <span>Remaining Wallet Balance:</span>
                <span className="font-bold">₹{Number(receiptData.new_wallet_balance).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setReceiptOpen(false)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-all"
              >
                Close Receipt
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
