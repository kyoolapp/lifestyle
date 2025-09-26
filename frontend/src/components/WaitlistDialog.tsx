import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Sparkles,
  Target,
  Users,
  Heart,
  Star,
} from "lucide-react";
import { toast } from "sonner";

interface WaitlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isInline?: boolean;
}

interface FormData {
  personType: string;
  activityLevel: string;
  currentSituation: string;
  desiredResults: string;
  biggestChallenge: string;
  previousAttempts: string;
  budget: string;
  email: string;
  phone: string;
}

export function WaitlistDialog({ open, onOpenChange, isInline = false }: WaitlistDialogProps) {
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    personType: "",
    activityLevel: "",
    currentSituation: "",
    desiredResults: "",
    biggestChallenge: "",
    previousAttempts: "",
    budget: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("WaitlistDialog open:", open);
  }, [open]);

  // Keep the body of the dialog scrolled to top when step changes
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      const el = document.querySelector('[data-slot="dialog-content"]');
      if (el) (el as HTMLElement).scrollTop = 0;
    }, 50);
    return () => clearTimeout(t);
  }, [step, open]);

  const totalSteps = 7;
  const updateFormData = (field: keyof FormData, value: string) =>
    setFormData((p) => ({ ...p, [field]: value }));

  const nextStep = () => step < totalSteps && setStep((s) => s + 1);
  const prevStep = () => step > 1 && setStep((s) => s - 1);

  const handleSubmit = () => {
    console.log("Submitted data:", formData);
    setIsSubmitted(true);
    toast.success("Confirmation email sent! You will also receive a WhatsApp message shortly.");
  };

  const handleClose = () => {
    setStep(1);
    setIsSubmitted(false);
    setFormData({
      personType: "",
      activityLevel: "",
      currentSituation: "",
      desiredResults: "",
      biggestChallenge: "",
      previousAttempts: "",
      budget: "",
      email: "",
      phone: "",
    });
    onOpenChange(false);
  };

  const icons = [Target, Users, Heart, Star, Sparkles, Target, CheckCircle];
  const StepIcon = icons[step - 1];

  const colors = [
    { text: "text-blue-600", btn: "bg-blue-500 hover:bg-blue-600" },
    { text: "text-purple-600", btn: "bg-purple-500 hover:bg-purple-600" },
    { text: "text-red-600", btn: "bg-red-500 hover:bg-red-600" },
    { text: "text-orange-600", btn: "bg-orange-500 hover:bg-orange-600" },
    { text: "text-green-600", btn: "bg-green-500 hover:bg-green-600" },
    { text: "text-pink-600", btn: "bg-pink-500 hover:bg-pink-600" },
    { text: "text-emerald-600", btn: "bg-emerald-500 hover:bg-emerald-600" },
  ];
  const current = colors[step - 1];

  const WizardBody = (
    <>
      <DialogHeader className="relative z-10">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center shadow">
            <StepIcon className={`w-8 h-8 ${current.text}`} />
          </div>
        </div>

        <DialogTitle className="text-center text-2xl bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
          Join the KA Waitlist
        </DialogTitle>
        <DialogDescription className="text-center">
          Help us personalize your KA experience by answering a few quick questions.
        </DialogDescription>

        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span className="font-medium">
            Step {step} of {totalSteps}
          </span>
          <div className="flex space-x-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  i + 1 <= step ? "bg-primary shadow-sm" : "bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        </div>
      </DialogHeader>

      {/* SOLID white surfaces only */}
      <div className="py-6 px-2 relative z-10 min-h-[400px] space-y-6">
        {step === 1 && (
          <div className="bg-white dark:bg-card rounded-2xl p-6 border border-border shadow-lg">
            <Label className={`text-lg font-medium ${current.text} mb-4 block`}>👤 What type of person are you?</Label>
            <RadioGroup
              value={formData.personType}
              onValueChange={(v: string) => updateFormData("personType", v)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/40 border border-border">
                <RadioGroupItem value="student" id="student" />
                <Label htmlFor="student" className="cursor-pointer font-medium">
                  Student
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/40 border border-border">
                <RadioGroupItem value="professional" id="professional" />
                <Label htmlFor="professional" className="cursor-pointer font-medium">
                  Working Professional
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/40 border border-border">
                <RadioGroupItem value="executive" id="executive" />
                <Label htmlFor="executive" className="cursor-pointer font-medium">
                  Executive/Leadership
                </Label>
              </div>
            </RadioGroup>

            <div className="mt-6">
              <Label className={`text-lg font-medium ${current.text} mb-4 block`}>🏃‍♂️ How active are you currently?</Label>
              <Select value={formData.activityLevel} onValueChange={(v: string) => updateFormData("activityLevel", v)}>
                <SelectTrigger className="mt-2 bg-white dark:bg-card border border-border">
                  <SelectValue placeholder="Select your activity level" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  sideOffset={8}
                  className="z-[2147483647] bg-white dark:bg-neutral-900 border shadow-xl rounded-md"
                >
                  <SelectItem value="sedentary">Sedentary (desk job, minimal exercise)</SelectItem>
                  <SelectItem value="lightly-active">Lightly Active (some walking, occasional exercise)</SelectItem>
                  <SelectItem value="moderately-active">Moderately Active (regular exercise 2-3x/week)</SelectItem>
                  <SelectItem value="very-active">Very Active (exercise 4+ times/week)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white dark:bg-card rounded-2xl p-6 border border-border shadow-lg">
            <Label className={`text-lg font-medium ${current.text} mb-4 block`}>
              🎯 Which best describes your current situation?
            </Label>
            <Select value={formData.currentSituation} onValueChange={(v: string) => updateFormData("currentSituation", v)}>
              <SelectTrigger className="mt-2 bg-white dark:bg-card border border-border">
                <SelectValue placeholder="Select your current situation" />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={8} className="z-[2147483647] bg-white dark:bg-neutral-900 border shadow-xl rounded-md">
                <SelectItem value="no-time">⏰ No time for health due to work demands</SelectItem>
                <SelectItem value="stressed">😰 Constantly stressed and exhausted</SelectItem>
                <SelectItem value="unhealthy-habits">🍔 Stuck in unhealthy eating/lifestyle habits</SelectItem>
                <SelectItem value="weight-issues">⚖️ Struggling with weight management</SelectItem>
                <SelectItem value="low-energy">🔋 Low energy and poor sleep quality</SelectItem>
                <SelectItem value="health-concerns">🏥 Developing health concerns</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white dark:bg-card rounded-2xl p-6 border border-border shadow-lg">
            <Label className={`text-lg font-medium ${current.text} mb-4 block`}>
              ✨ Which best describes the results you're trying to achieve?
            </Label>
            <Select value={formData.desiredResults} onValueChange={(v: string) => updateFormData("desiredResults", v)}>
              <SelectTrigger className="mt-2 bg-white dark:bg-card border border-border">
                <SelectValue placeholder="Select your desired outcome" />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={8} className="z-[2147483647] bg-white dark:bg-neutral-900 border shadow-xl rounded-md">
                <SelectItem value="weight-loss">🏃‍♀️ Sustainable weight loss</SelectItem>
                <SelectItem value="energy-boost">⚡ More energy throughout the day</SelectItem>
                <SelectItem value="stress-management">🧘‍♂️ Better stress management</SelectItem>
                <SelectItem value="work-life-balance">⚖️ Improved work-life balance</SelectItem>
                <SelectItem value="fitness-routine">💪 Consistent fitness routine</SelectItem>
                <SelectItem value="overall-wellness">🌟 Complete lifestyle transformation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {step === 4 && (
          <div className="bg-white dark:bg-card rounded-2xl p-6 border border-border shadow-lg">
            <Label className={`text-lg font-medium ${current.text} mb-4 block`}>
              🚧 What's the biggest challenge you've experienced while trying to get that result?
            </Label>
            <Select value={formData.biggestChallenge} onValueChange={(v: string) => updateFormData("biggestChallenge", v)}>
              <SelectTrigger className="mt-2 bg-white dark:bg-card border border-border">
                <SelectValue placeholder="Select your biggest challenge" />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={8} className="z-[2147483647] bg-white dark:bg-neutral-900 border shadow-xl rounded-md">
                <SelectItem value="time-constraints">⏱️ Time constraints from work</SelectItem>
                <SelectItem value="lack-motivation">😔 Lack of motivation or consistency</SelectItem>
                <SelectItem value="no-plan">❓ Don't know where to start/no clear plan</SelectItem>
                <SelectItem value="travel-schedule">✈️ Frequent travel disrupting routines</SelectItem>
                <SelectItem value="social-pressure">🍸 Work social events and unhealthy culture</SelectItem>
                <SelectItem value="information-overload">🤯 Too much conflicting health information</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {step === 5 && (
          <div className="bg-white dark:bg-card rounded-2xl p-6 border border-border shadow-lg">
            <Label className={`text-lg font-medium ${current.text} mb-4 block`}>
              📝 What else have you tried to achieve your health goals?
            </Label>
            <Textarea
              value={formData.previousAttempts}
              onChange={(e) => updateFormData("previousAttempts", e.target.value)}
              placeholder="Tell us about previous attempts, apps, programs, or methods you've tried..."
              className="mt-2 min-h-[120px] bg-white dark:bg-card border border-border"
            />
            <p className="text-sm text-muted-foreground mt-2">This helps us understand what hasn't worked for you so we can design something better.</p>
          </div>
        )}

        {step === 6 && (
          <div className="bg-white dark:bg-card rounded-2xl p-6 border border-border shadow-lg">
            <Label className={`text-lg font-medium ${current.text} mb-4 block`}>
              💰 Which price point best describes your current budget for achieving your health goals?
            </Label>
            <Select value={formData.budget} onValueChange={(v: string) => updateFormData("budget", v)}>
              <SelectTrigger className="mt-2 bg-white dark:bg-card border border-border">
                <SelectValue placeholder="Select your budget range" />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={8} className="z-[2147483647] bg-white dark:bg-neutral-900 border shadow-xl rounded-md">
                <SelectItem value="under-50">💵 Under $50/month</SelectItem>
                <SelectItem value="50-100">💸 $50-100/month</SelectItem>
                <SelectItem value="100-200">💳 $100-200/month</SelectItem>
                <SelectItem value="200-500">💎 $200-500/month</SelectItem>
                <SelectItem value="500-plus">🏆 $500+/month</SelectItem>
                <SelectItem value="flexible">✨ Budget is flexible for the right solution</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-3">This helps us design a pricing structure that works for professionals like you.</p>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-card rounded-2xl p-6 border border-border shadow-lg">
              <Label htmlFor="email" className={`text-lg font-medium ${current.text} mb-4 block`}>
                📧 Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData("email", e.target.value)}
                placeholder="your.email@company.com"
                className="mt-2 bg-white dark:bg-card border border-border"
                required
              />
            </div>

            <div className="bg-white dark:bg-card rounded-2xl p-6 border border-border shadow-lg">
              <Label htmlFor="phone" className={`text-lg font-medium ${current.text} mb-4 block`}>
                📱 Phone Number (for WhatsApp updates)
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateFormData("phone", e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="mt-2 bg-white dark:bg-card border border-border"
              />
            </div>

            <div className="bg-neutral-50 dark:bg-neutral-900/40 rounded-xl p-4 border border-border">
              <p className={`text-sm ${current.text} font-medium`}>🎉 We'll send you a confirmation email and WhatsApp message once you join the waitlist.</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer (solid) */}
      <div className="sticky bottom-0 mt-8 pt-6 border-t border-border bg-white dark:bg-card z-10">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={step === 1}
            className="flex items-center px-6 py-2 rounded-full disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>

          {step < totalSteps ? (
            <Button
              onClick={nextStep}
              disabled={
                (step === 1 && (!formData.personType || !formData.activityLevel)) ||
                (step === 2 && !formData.currentSituation) ||
                (step === 3 && !formData.desiredResults) ||
                (step === 4 && !formData.biggestChallenge) ||
                (step === 6 && !formData.budget)
              }
              className={`flex items-center px-8 py-2 rounded-full ${current.btn} text-black font-medium shadow-lg disabled:opacity-50`}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!formData.email}
              className="flex items-center px-8 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-black font-medium shadow-lg disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Join Waitlist
            </Button>
          )}
        </div>
      </div>
    </>
  );

  const SubmittedBody = (
    <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto rounded-lg border shadow-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white">
      <div className="relative z-10 flex flex-col items-center justify-center h-full p-6">
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6 shadow-lg">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <DialogHeader className="text-center">
<DialogTitle className="mb-6 text-2xl font-bold">
  Welcome to KyoolApp!  
</DialogTitle>

          <DialogDescription className="mb-6">
            You've successfully joined our exclusive waitlist for early access.
          </DialogDescription>
        </DialogHeader>
        <Button
          onClick={handleClose}
          className="bg-white text-green-600 hover:bg-white/90 px-6 py-2 rounded-full font-semibold"
        >
          Close
        </Button>
      </div>
    </DialogContent>
  );

  const SubmittedInline = (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-2xl text-center">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h3 className="mb-3 text-2xl font-bold text-gray-900">Welcome to the KA Waitlist!</h3>
        <p className="text-gray-700 mb-6 leading-relaxed">
          Thank you for joining. We'll be in touch soon with exclusive early access to KA and priority coaching opportunities.
        </p>
        <div className="bg-green-50 rounded-xl p-4 border border-green-200 mb-6">
          <p className="text-sm text-green-700 font-medium">📧 Confirmation email sent • 📱 WhatsApp message incoming</p>
        </div>
        <Button onClick={() => onOpenChange(false)} className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-2 rounded-full">
          Continue
        </Button>
      </div>
    </div>
  );

  if (isInline) {
    if (isSubmitted) return SubmittedInline;
    return (
      <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-2xl relative overflow-hidden max-w-2xl mx-auto">
        {WizardBody}
      </div>
    );
  }

  if (isSubmitted) return <Dialog open={open} onOpenChange={onOpenChange}>{SubmittedBody}</Dialog>;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto rounded-lg border shadow-xl">
        {WizardBody}
      </DialogContent>
    </Dialog>
  );
}