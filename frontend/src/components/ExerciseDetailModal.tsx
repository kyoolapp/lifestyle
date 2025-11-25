import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Plus, X, AlertCircle } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Exercise {
  id: string;
  name: string;
  targetMuscles?: string[] | undefined;
  bodyParts?: string[] | undefined;
  equipments?: string[] | undefined;
  secondaryMuscles?: string[] | undefined;
  instructions?: string[] | undefined;
  gifUrl: string;
}

interface ExerciseDetailModalProps {
  exercise: Exercise | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddExercise: (exercise: Exercise) => void;
  isAdded: boolean;
}

export function ExerciseDetailModal({
  exercise,
  open,
  onOpenChange,
  onAddExercise,
  isAdded
}: ExerciseDetailModalProps) {
  if (!exercise) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[95vh] p-0 flex flex-col overflow-hidden">
        {/* Close button */}
        <DialogHeader className="sticky top-0 bg-background z-10 border-b px-4 md:px-6 py-4 shrink-0">
          <DialogTitle className="text-lg md:text-2xl font-bold capitalize line-clamp-2">
            {exercise.name}
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 space-y-4 md:space-y-6 px-4 md:px-6 py-4">
          {/* Exercise GIF */}
          <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 h-full aspect-video">
            {exercise.gifUrl ? (
              <ImageWithFallback
                src={exercise.gifUrl}
                alt={exercise.name}
                className="h-full object-cover flex items-center justify-center"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Target Muscles */}
          <div>
            <h3 className="text-xs md:text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
              TARGET MUSCLES
            </h3>
            <div className="flex flex-wrap gap-2">
              {exercise.targetMuscles && exercise.targetMuscles.length > 0 ? (
                exercise.targetMuscles.map((muscle) => (
                  <Badge key={muscle} className="capitalize text-xs md:text-sm">
                    {muscle}
                  </Badge>
                ))
              ) : (
                <p className="text-xs md:text-sm text-muted-foreground">Not specified</p>
              )}
            </div>
          </div>

          {/* Body Parts */}
          <div>
            <h3 className="text-xs md:text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
              BODY PARTS
            </h3>
            <div className="flex flex-wrap gap-2">
              {exercise.bodyParts && exercise.bodyParts.length > 0 ? (
                exercise.bodyParts.map((part) => (
                  <Badge key={part} variant="outline" className="capitalize text-xs md:text-sm">
                    {part}
                  </Badge>
                ))
              ) : (
                <p className="text-xs md:text-sm text-muted-foreground">Not specified</p>
              )}
            </div>
          </div>

          {/* Secondary Muscles */}
          {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
            <div>
              <h3 className="text-xs md:text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                SECONDARY MUSCLES
              </h3>
              <div className="flex flex-wrap gap-2">
                {exercise.secondaryMuscles.map((muscle) => (
                  <Badge
                    key={muscle}
                    variant="secondary"
                    className="capitalize text-xs"
                  >
                    {muscle}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Equipment */}
          <div>
            <h3 className="text-xs md:text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
              EQUIPMENT REQUIRED
            </h3>
            <div className="flex flex-wrap gap-2">
              {exercise.equipments && exercise.equipments.length > 0 ? (
                exercise.equipments.map((equipment) => (
                  <Badge
                    key={equipment}
                    variant="secondary"
                    className="capitalize text-xs md:text-sm"
                  >
                    {equipment}
                  </Badge>
                ))
              ) : (
                <p className="text-xs md:text-sm text-muted-foreground">Not specified</p>
              )}
            </div>
          </div>

            <Separator />

          {/* Instructions */}
          {exercise.instructions && exercise.instructions.length > 0 && (
            <div>
              <h3 className="text-base md:text-lg font-semibold mb-3 uppercase tracking-wide">Instructions</h3>
              <ol className="space-y-2 md:space-y-3">
                {exercise.instructions.map((instruction, idx) => (
                  <li key={idx} className="flex gap-2 md:gap-3">
                    <span className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs md:text-sm font-semibold">
                      {idx + 1}
                    </span>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed pt-0.5 md:pt-1">
                      {instruction}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <Separator />

          {/* Add Button */}
          <div className="flex gap-2 pt-2 md:pt-4 pb-2">
            <Button
              onClick={() => {
                onAddExercise(exercise);
                onOpenChange(false);
              }}
              disabled={isAdded}
              size="lg"
              className="flex-1 gap-2 text-sm md:text-base h-10 md:h-12"
              variant={isAdded ? 'outline' : 'default'}
            >
              <Plus className="w-4 h-4" />
              {isAdded ? 'Already Added' : 'Add to Routine'}
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              size="lg"
              className="text-sm md:text-base h-10 md:h-12 px-3 md:px-4"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
