import { forgotPassword } from '@/services/authService';
import { ROUTES } from '@/utils/constants';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const ForgotPassword = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: ({ email }) => forgotPassword(email),
    onSuccess: (_, { email }) => {
      sessionStorage.setItem('fpEmail', email);
      toast.success('OTP sent! Check your email.');
      navigate(ROUTES.VERIFY_OTP);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    },
  });

  const onSubmit = (data) => mutation.mutate(data);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-card p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <span className="text-3xl">🔑</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Enter your registered email and we'll send you an OTP to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? 'Sending OTP…' : 'Send OTP'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Remember your password?{' '}
          <Link to={ROUTES.LOGIN} className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
