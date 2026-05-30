import { registerStore } from '@/services/storeService';
import { VENDOR_ROUTES } from '@/utils/constants';
import { CheckCircle, Loader2, Store } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

const VendorRegister = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    name: '', ownerName: '', email: '', phone: '', description: '',
    gstin: '', street: '', city: '', state: '', pincode: '',
    lat: '', lng: '', serviceRadius: 5,
  });

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerStore({
        name: form.name, ownerName: form.ownerName, email: form.email,
        phone: form.phone, description: form.description, gstin: form.gstin,
        street: form.street, city: form.city, state: form.state, pincode: form.pincode,
        ...(form.lat && form.lng ? { lat: parseFloat(form.lat), lng: parseFloat(form.lng) } : {}),
        serviceRadius: Number(form.serviceRadius),
      });
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0E1117] via-[#161B27] to-[#0E1117] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/10 rounded-full mb-6 border border-green-500/30">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-2xl font-black text-white mb-3">Application Submitted!</h2>
          <p className="text-gray-400 mb-2 text-sm leading-relaxed">
            Your store <span className="text-white font-semibold">"{form.name}"</span> has been submitted for review.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Our team will review your application and notify you at <span className="text-amber-400">{form.email}</span> within 24–48 hours.
          </p>
          <Link to={VENDOR_ROUTES.LOGIN}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold px-6 py-3 rounded-xl text-sm uppercase tracking-widest transition">
            <Store className="w-4 h-4" /> Go to Vendor Login
          </Link>
        </div>
      </div>
    );
  }

  const inputCls = "w-full bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition";
  const labelCls = "block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5";

  const field = (label, key, type = 'text', opts = {}) => (
    <div className={opts.span === 2 ? 'md:col-span-2' : ''}>
      <label className={labelCls}>{label}</label>
      <input type={type} value={form[key]} onChange={set(key)}
        required={opts.required !== false} placeholder={opts.placeholder}
        className={inputCls}
      />
      {opts.hint && <p className="text-xs text-gray-600 mt-1">{opts.hint}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0E1117] via-[#161B27] to-[#0E1117] py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-500/10 rounded-2xl mb-4 border border-amber-500/20">
            <Store className="w-7 h-7 text-amber-400" />
          </div>
          <h1 className="text-2xl font-black text-white uppercase italic tracking-tight">Register Your Store</h1>
          <p className="text-gray-400 text-sm mt-1">Join the Divine-Kart hyperlocal network</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#161B27] border border-gray-800 rounded-2xl p-8 shadow-2xl space-y-8">
          <div>
            <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest mb-4">Store Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {field('Store Name', 'name', 'text', { placeholder: 'Shri Ram Puja Store' })}
              {field('Owner Name', 'ownerName', 'text', { placeholder: 'Your full name' })}
              {field('Email', 'email', 'email', { placeholder: 'store@example.com' })}
              {field('Phone', 'phone', 'tel', { placeholder: '9876543210' })}
              <div className="md:col-span-2">
                <label className={labelCls}>Description</label>
                <textarea value={form.description} onChange={set('description')} rows={3}
                  placeholder="What do you sell? (optional)"
                  className={`${inputCls} resize-none`} />
              </div>
              {field('GSTIN', 'gstin', 'text', { placeholder: '22AAAAA0000A1Z5', required: false })}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest mb-4">Store Address</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {field('Street', 'street', 'text', { span: 2, placeholder: '123, MG Road' })}
              {field('City', 'city', 'text', { placeholder: 'Kolkata' })}
              {field('State', 'state', 'text', { placeholder: 'West Bengal' })}
              {field('Pincode', 'pincode', 'text', { placeholder: '700001' })}
              {field('Service Radius (km)', 'serviceRadius', 'number', { placeholder: '5' })}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest mb-1">Location Coordinates</h3>
            <p className="text-xs text-gray-500 mb-4">Optional — enables faster store matching for nearby customers.</p>
            <div className="grid md:grid-cols-2 gap-4">
              {field('Latitude', 'lat', 'number', { required: false, placeholder: '22.5726' })}
              {field('Longitude', 'lng', 'number', { required: false, placeholder: '88.3639' })}
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3.5 rounded-xl text-sm uppercase tracking-widest transition disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Submitting…' : 'Submit Store Application'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Already registered?{' '}
            <Link to={VENDOR_ROUTES.LOGIN} className="text-amber-400 font-bold hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default VendorRegister;
