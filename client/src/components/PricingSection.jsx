import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Check, X, Sparkles, Loader2 } from 'lucide-react';
import { PLANS, getPlanPrice } from '../config/pricing';

const PricingSection = ({ showHeader = true, id = 'pricing' }) => {
  const { user, isAuthenticated, upgradeUserPlan } = useAuth();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('Monthly');
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleUpgrade = async (planName) => {
    if (!isAuthenticated) {
      navigate('/login?redirect=pricing');
      return;
    }

    try {
      setLoadingPlan(planName);
      setSuccessMessage('');
      const message = await upgradeUserPlan(planName);
      setSuccessMessage(message);
      window.scrollTo({ top: document.getElementById(id)?.offsetTop ?? 0, behavior: 'smooth' });
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      alert(err.message || 'Failed to upgrade plan.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const currentPlan = user?.plan === 'Free' ? 'Basic' : user?.plan;
  const basicPricing = getPlanPrice('Basic', billingCycle);
  const proPricing = getPlanPrice('Pro', billingCycle);
  const ultraPricing = getPlanPrice('Ultra', billingCycle);

  const renderSpecs = (planKey) => {
    const plan = PLANS[planKey];
    return (
      <div className="border-t border-slate-100 pt-6 space-y-3.5 text-xs text-slate-600">
        <div className="flex justify-between items-center">
          <span>PDF Downloads Limit</span>
          <span className={`font-bold ${planKey === 'Ultra' ? 'text-emerald-600 font-extrabold' : 'text-slate-800'}`}>
            {plan.downloads}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span>Maximum file size upload</span>
          <span className="font-bold text-slate-800">{plan.uploadSize}</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Access semesters 1 to 8</span>
          <span className="font-bold text-slate-800">Yes</span>
        </div>
        <div className="flex justify-between items-center">
          <span>In-browser PDF preview</span>
          <span className="font-bold text-slate-800">Yes</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Priority support</span>
          {plan.prioritySupport ? (
            <Check className="h-4 w-4 text-emerald-600" />
          ) : (
            <X className="h-4 w-4 text-slate-300" />
          )}
        </div>
        <div className="flex justify-between items-center">
          <span>Ad-free experience</span>
          {plan.adFree ? (
            <Check className="h-4 w-4 text-emerald-600" />
          ) : (
            <X className="h-4 w-4 text-slate-300" />
          )}
        </div>
      </div>
    );
  };

  return (
    <section id={id} className="bg-slate-50 py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-200">
      <div className="max-w-6xl mx-auto text-center">

        {successMessage && (
          <div className="max-w-md mx-auto bg-emerald-50 border border-emerald-200 text-emerald-800 p-5 rounded-2xl mb-8 shadow-sm flex items-center justify-center gap-3">
            <Sparkles className="h-6 w-6 text-emerald-600 flex-shrink-0" />
            <div className="text-sm font-extrabold">{successMessage}</div>
          </div>
        )}

        {showHeader ? (
          <div className="mb-10">
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight">Select a plan</h2>
            <p className="text-lg text-slate-500 font-medium mt-3">One subscription for a lifetime of notes.</p>
          </div>
        ) : (
          <div className="mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Choose your plan</h2>
            <p className="text-sm text-slate-500 font-medium mt-2">Upgrade anytime to unlock more downloads.</p>
          </div>
        )}

        <div className="flex justify-center mb-12">
          <div className="bg-slate-200/70 p-1 rounded-full flex items-center border border-slate-300">
            {['Monthly', 'Quarterly'].map((cycle) => (
              <button
                key={cycle}
                type="button"
                onClick={() => setBillingCycle(cycle)}
                className={`px-6 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
                  billingCycle === cycle
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cycle}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">

          {/* Basic */}
          <div className={`bg-white border rounded-3xl p-8 flex flex-col justify-between shadow-sm relative transition-all duration-300 ${
            currentPlan === 'Basic' ? 'border-ucp-blue ring-2 ring-ucp-blue/20' : 'border-slate-200 hover:shadow-md'
          }`}>
            {currentPlan === 'Basic' && (
              <span className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-ucp-blue text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                Current Plan
              </span>
            )}
            <div className="text-left space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{PLANS.Basic.name}</h3>
                <p className="text-slate-400 text-xs mt-1">{PLANS.Basic.tagline}</p>
              </div>
              <div className="pt-2">
                <span className="text-3xl font-black text-slate-800">Rs. {basicPricing.price}</span>
                <span className="text-sm font-semibold text-slate-500">{basicPricing.period}</span>
                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">{basicPricing.note}</p>
              </div>
              {renderSpecs('Basic')}
            </div>
            <div className="mt-8 pt-4">
              <button
                type="button"
                onClick={() => handleUpgrade('Basic')}
                disabled={loadingPlan || currentPlan === 'Basic'}
                className={`w-full py-3.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
                  currentPlan === 'Basic'
                    ? 'bg-slate-100 text-slate-400 cursor-default'
                    : 'bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 active:scale-95'
                }`}
              >
                {loadingPlan === 'Basic' ? (
                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                ) : currentPlan === 'Basic' ? (
                  'Active Plan'
                ) : (
                  'Switch to Basic'
                )}
              </button>
            </div>
          </div>

          {/* Pro */}
          <div className={`bg-white border rounded-3xl p-8 flex flex-col justify-between shadow-sm relative transition-all duration-300 ${
            currentPlan === 'Pro'
              ? 'border-emerald-600 ring-2 ring-emerald-600/20 scale-[1.02]'
              : 'border-slate-200 hover:shadow-md'
          }`}>
            <span className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              <span>Most Popular</span>
            </span>
            <div className="text-left space-y-4">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-slate-800">{PLANS.Pro.name}</h3>
                  {billingCycle === 'Quarterly' && (
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-100">
                      Discount Applied
                    </span>
                  )}
                </div>
                <p className="text-slate-400 text-xs mt-1">{PLANS.Pro.tagline}</p>
              </div>
              <div className="pt-2">
                <span className="text-3xl font-black text-slate-800">Rs. {proPricing.price}</span>
                <span className="text-sm font-semibold text-slate-500">{proPricing.period}</span>
                <p className="text-[10px] text-emerald-600 font-bold mt-1 uppercase">{proPricing.note}</p>
              </div>
              {renderSpecs('Pro')}
            </div>
            <div className="mt-8 pt-4">
              <button
                type="button"
                onClick={() => handleUpgrade('Pro')}
                disabled={loadingPlan || currentPlan === 'Pro'}
                className={`w-full py-3.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
                  currentPlan === 'Pro'
                    ? 'bg-slate-100 text-slate-400 cursor-default'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg active:scale-95'
                }`}
              >
                {loadingPlan === 'Pro' ? (
                  <Loader2 className="h-4 w-4 animate-spin mx-auto text-white" />
                ) : currentPlan === 'Pro' ? (
                  'Active Plan'
                ) : (
                  'Get Pro'
                )}
              </button>
            </div>
          </div>

          {/* Ultra */}
          <div className={`bg-white border rounded-3xl p-8 flex flex-col justify-between shadow-sm relative transition-all duration-300 ${
            currentPlan === 'Ultra' ? 'border-ucp-blue ring-2 ring-ucp-blue/20' : 'border-slate-200 hover:shadow-md'
          }`}>
            {currentPlan === 'Ultra' && (
              <span className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-ucp-blue text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                Current Plan
              </span>
            )}
            <div className="text-left space-y-4">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-slate-800">{PLANS.Ultra.name}</h3>
                  {billingCycle === 'Quarterly' && (
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-100">
                      Discount Applied
                    </span>
                  )}
                </div>
                <p className="text-slate-400 text-xs mt-1">{PLANS.Ultra.tagline}</p>
              </div>
              <div className="pt-2">
                <span className="text-3xl font-black text-slate-800">Rs. {ultraPricing.price}</span>
                <span className="text-sm font-semibold text-slate-500">{ultraPricing.period}</span>
                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">{ultraPricing.note}</p>
              </div>
              {renderSpecs('Ultra')}
            </div>
            <div className="mt-8 pt-4">
              <button
                type="button"
                onClick={() => handleUpgrade('Ultra')}
                disabled={loadingPlan || currentPlan === 'Ultra'}
                className={`w-full py-3.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
                  currentPlan === 'Ultra'
                    ? 'bg-slate-100 text-slate-400 cursor-default'
                    : 'bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 active:scale-95'
                }`}
              >
                {loadingPlan === 'Ultra' ? (
                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                ) : currentPlan === 'Ultra' ? (
                  'Active Plan'
                ) : (
                  'Get Ultra'
                )}
              </button>
            </div>
          </div>

        </div>

        <p className="mt-12 text-slate-400 text-xs font-semibold">Cancel anytime. 14-day money-back guarantee.</p>
      </div>
    </section>
  );
};

export default PricingSection;
