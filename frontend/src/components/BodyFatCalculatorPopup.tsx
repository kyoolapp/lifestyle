import { useState, useEffect, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { calculateBodyFat, getBodyFatCategory } from '../utils/health';
import { useUnitSystem } from '../context/UnitContext';
import { heightInFeetInchesFromCm } from '../utils/unitConversion';

interface BodyFatCalculatorPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCalculate: (measurements: {
    height: number;
    neck: number;
    waist: number;
    hip?: number;
    bodyFat: number;
  }) => Promise<void>;
  gender: string;
  height?: number;
  isLoading?: boolean;
}

export function BodyFatCalculatorPopup({
  open,
  onOpenChange,
  onCalculate,
  gender,
  height: initialHeight,
  isLoading = false,
}: BodyFatCalculatorPopupProps) {
  const { unitSystem } = useUnitSystem();
  const [height, setHeight] = useState<string>('');
  const [neck, setNeck] = useState<string>('');
  const [waist, setWaist] = useState<string>('');
  const [hip, setHip] = useState<string>('');
  const [calculatedBodyFat, setCalculatedBodyFat] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const [localLoading, setLocalLoading] = useState(false);

  const isFemale = gender === 'female' || gender === 'f';
  const isFormValid = height && neck && waist && (isFemale ? hip : true);
  const unit = unitSystem === 'metric' ? 'cm' : 'in';

  // Initialize height when opening or when initialHeight changes
  useEffect(() => {
    if (open && initialHeight) {
      if (unitSystem === 'metric') {
        setHeight(initialHeight.toString());
      } else {
        const { feet, inches } = heightInFeetInchesFromCm(initialHeight);
        const totalInches = feet * 12 + inches;
        setHeight(totalInches.toFixed(2));
      }
    }
  }, [open, initialHeight, unitSystem]);

  const handleCalculate = useCallback(() => {
    setError('');
    
    let h = parseFloat(height);
    let n = parseFloat(neck);
    let w = parseFloat(waist);
    let hi = isFemale ? parseFloat(hip) : undefined;

    if (isNaN(h) || isNaN(n) || isNaN(w) || (isFemale && isNaN(hi!))) {
      setError('Please enter valid numbers for all measurements');
      return;
    }

    if (h <= 0 || n <= 0 || w <= 0 || (isFemale && hi! <= 0)) {
      setError('All measurements must be greater than 0');
      return;
    }

    if (w <= n) {
      setError('Waist circumference must be larger than neck');
      return;
    }

    if (isFemale && hi! <= n) {
      setError('Hip circumference must be larger than neck');
      return;
    }

    // Convert from user's unit to metric (cm) for calculation
    if (unitSystem === 'imperial') {
      // Convert inches to cm
      h = h * 2.54;
      n = n * 2.54;
      w = w * 2.54;
      if (hi !== undefined) {
        hi = hi * 2.54;
      }
    }

    const bodyFat = calculateBodyFat(gender, h, n, w, hi);
    
    if (bodyFat === null) {
      setError('Invalid measurements. Please check your inputs.');
      return;
    }

    setCalculatedBodyFat(bodyFat);
  }, [height, neck, waist, hip, isFemale, unitSystem, gender]);

  const handleSave = useCallback(async () => {
    if (calculatedBodyFat === null) return;

    try {
      setLocalLoading(true);
      let h = parseFloat(height);
      let n = parseFloat(neck);
      let w = parseFloat(waist);
      let hi = isFemale ? parseFloat(hip) : undefined;

      // Convert to metric (cm) for database storage
      if (unitSystem === 'imperial') {
        h = h * 2.54;
        n = n * 2.54;
        w = w * 2.54;
        if (hi !== undefined) {
          hi = hi * 2.54;
        }
      }

      await onCalculate({
        height: h,
        neck: n,
        waist: w,
        hip: hi,
        bodyFat: calculatedBodyFat,
      });

      // Reset form
      setHeight('');
      setNeck('');
      setWaist('');
      setHip('');
      setCalculatedBodyFat(null);
      setError('');
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save body fat measurement');
    } finally {
      setLocalLoading(false);
    }
  }, [calculatedBodyFat, height, neck, waist, hip, isFemale, unitSystem, onCalculate, onOpenChange]);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setHeight(initialHeight?.toString() || '');
      setNeck('');
      setWaist('');
      setHip('');
      setCalculatedBodyFat(null);
      setError('');
    }
    onOpenChange(newOpen);
  }, [initialHeight, onOpenChange]);

  const category = useMemo(() => 
    calculatedBodyFat ? getBodyFatCategory(calculatedBodyFat, gender) : null,
    [calculatedBodyFat, gender]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Calculate Body Fat %</DialogTitle>
          <DialogDescription>
            Navy Method using circumference measurements
          </DialogDescription>
        </DialogHeader>

        {!calculatedBodyFat ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="height">Height ({unit})</Label>
              <Input
                id="height"
                type="number"
                placeholder={unitSystem === 'metric' ? '170' : '67'}
                value={height}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHeight(e.target.value)}
                disabled={isLoading || localLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="neck">Neck ({unit})</Label>
              <Input
                id="neck"
                type="number"
                placeholder={unitSystem === 'metric' ? '38' : '15'}
                value={neck}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNeck(e.target.value)}
                disabled={isLoading || localLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="waist">Waist ({unit})</Label>
              <Input
                id="waist"
                type="number"
                placeholder={unitSystem === 'metric' ? '85' : '33'}
                value={waist}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWaist(e.target.value)}
                disabled={isLoading || localLoading}
              />
            </div>

            {isFemale && (
              <div className="space-y-2">
                <Label htmlFor="hip">Hip ({unit})</Label>
                <Input
                  id="hip"
                  type="number"
                  placeholder={unitSystem === 'metric' ? '95' : '37'}
                  value={hip}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHip(e.target.value)}
                  disabled={isLoading || localLoading}
                />
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading || localLoading}
              >
                Cancel
              </Button>
              <Button
                variant ="outline"
                onClick={handleCalculate}
                disabled={!isFormValid || isLoading || localLoading}
              >
                {isLoading || localLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  'Calculate'
                )}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-gradient-to-r p-4">
              <div className="text-sm font-medium text-muted-foreground">Your Body Fat Percentage</div>
              <div className="text-4xl font-bold">{calculatedBodyFat}%</div>
              <div className="mt-2 text-sm">
                <span className={`inline-block rounded-full px-3 py-1 text-white`}
                  style={{
                    backgroundColor: 
                      category?.color === 'blue' ? '#3b82f6' :
                      category?.color === 'green' ? '#10b981' :
                      category?.color === 'yellow' ? '#f59e0b' :
                      '#ef4444'
                  }}
                >
                  {category?.label}
                </span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">{category?.description}</div>
            </div>

            <div className="text-sm text-muted-foreground">
              <div>Height: {height} {unit}</div>
              <div>Neck: {neck} {unit}</div>
              <div>Waist: {waist} {unit}</div>
              {isFemale && <div>Hip: {hip} {unit}</div>}
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setCalculatedBodyFat(null)}
                disabled={isLoading || localLoading}
              >
                Recalculate
              </Button>
              <Button
              variant ="outline"
                onClick={handleSave}
                disabled={isLoading || localLoading}
              >
                {isLoading || localLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
