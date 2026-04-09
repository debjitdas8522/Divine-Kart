import { forgotPassword, verifyForgotPasswordOtp } from '@/services/authService';
import { ROUTES } from '@/utils/constants';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';

const schema = z.object({
  otp: z
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d+$/, 'OTP must contain only numbers'),
});

const VerifyOtp = () => {
  const navigate = useNavigate();
  const email = sessionStorage.getItem('fpEmail');

  // Redirect back if there's no email stored (direct URL access)
  useEffect(() => {
    if (!email) navigate(ROUTES.FORGOT_PASSWORD, { replace: true });
  }, [email, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const verifyMutation = useMutation({
    mutationFn: ({ otp }) => verifyForgotPasswordOtp(email, otp),
    onSuccess: () => {
      toast.success('OTP verified!');
      navigate(ROUTES.RESET_PASSWORD);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Verification failed');
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => forgotPassword(email),
    onSuccess: () => toast.success('New OTP sent!'),
    onError: () => toast.error('Could not resend OTP'),
  });

  const onSubmit = (data) => verifyMutation.mutate(data);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-card p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <span className="text-3xl">📩</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Enter OTP</h1>
          <p className="text-gray-500 mt-2 text-sm">
            We sent a 6-digit OTP to{' '}
            <span className="font-semibold text-gray-700">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
              One-Time Password
            </label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              {...register('otp')}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
              placeholder="──────"
            />
            {errors.otp && (
              <p className="mt-1 text-sm text-red-600 text-center">{errors.otp.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={verifyMutation.isPending}
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {verifyMutation.isPending ? 'Verifying…' : 'Verify OTP'}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-2 text-sm text-gray-600">
          <span>
            Didn't receive it?{' '}
            <button
              onClick={() => resendMutation.mutate()}
              disabled={resendMutation.isPending}
              className="text-primary font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendMutation.isPending ? 'Sending…' : 'Resend OTP'}
            </button>
          </span>
          <Link to={ROUTES.LOGIN} className="text-gray-400 hover:text-gray-600 hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
