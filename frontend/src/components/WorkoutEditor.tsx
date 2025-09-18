import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from './ui/dropdown-menu';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  GripVertical,
  Plus, 
  Trash2, 
  Edit3,
  Save,
  X,
  Search,
  MoreVertical,
  Move,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion } from 'motion/react';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight: string;
  completed?: boolean;
}

interface WorkoutRoutine {
  id: number;
  name: string;
  exercises: Exercise[];
  duration: string;
  difficulty: string;
  targetMuscles: string[];
  createdBy: string;
  isPublic: boolean;
  downloads: number;
}

interface WorkoutEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routine: WorkoutRoutine | null;
  onSave: (routine: WorkoutRoutine) => void;
  exerciseLibrary: any[];
}

const ItemType = 'EXERCISE';

interface DraggedExercise {
  id: string;
  index: number;
}

function DraggableExercise({ 
  exercise, 
  index, 
  onMove, 
  onEdit, 
  onRemove 
}: {
  exercise: Exercise;
  index: number;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onEdit: (index: number, exercise: Exercise) => void;
  onRemove: (index: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    sets: exercise.sets,
    reps: exercise.reps,
    weight: exercise.weight
  });

  const [{ handlerId }, drop] = useDrop({
    accept: ItemType,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DraggedExercise, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      onMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: () => {
      return { id: exercise.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.4 : 1;
  drag(drop(ref));

  const handleSaveEdit = () => {
    onEdit(index, {
      ...exercise,
      sets: editData.sets,
      reps: editData.reps,
      weight: editData.weight
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditData({
      sets: exercise.sets,
      reps: exercise.reps,
      weight: exercise.weight
    });
    setIsEditing(false);
  };

  return (
    <div
      ref={ref}
      style={{ opacity }}
      data-handler-id={handlerId}
      className={`p-4 bg-white border rounded-lg transition-all ${
        isDragging ? 'shadow-lg rotate-1' : 'shadow-sm hover:shadow-md'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Drag Handle */}
        <div className="cursor-move text-gray-400 hover:text-gray-600">
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Exercise Number */}
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-medium text-sm">
          {index + 1}
        </div>

        {/* Exercise Details */}
        <div className="flex-1">
          <div className="font-medium">{exercise.name}</div>
          {!isEditing ? (
            <div className="text-sm text-gray-600">
              {exercise.sets} sets × {exercise.reps} @ {exercise.weight}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div>
                <Label className="text-xs">Sets</Label>
                <Input
                  type="number"
                  value={editData.sets}
                  onChange={(e) => setEditData(prev => ({ ...prev, sets: parseInt(e.target.value) || 1 }))}
                  className="h-8"
                  min="1"
                />
              </div>
              <div>
                <Label className="text-xs">Reps</Label>
                <Input
                  value={editData.reps}
                  onChange={(e) => setEditData(prev => ({ ...prev, reps: e.target.value }))}
                  className="h-8"
                  placeholder="8-12"
                />
              </div>
              <div>
                <Label className="text-xs">Weight</Label>
                <Input
                  value={editData.weight}
                  onChange={(e) => setEditData(prev => ({ ...prev, weight: e.target.value }))}
                  className="h-8"
                  placeholder="60kg"
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {!isEditing ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setIsEditing(true)}
              >
                <Edit3 className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                onClick={() => onRemove(index)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                onClick={handleSaveEdit}
              >
                <Save className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                onClick={handleCancelEdit}
              >
                <X className="w-3 h-3" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function WorkoutEditor({ 
  open, 
  onOpenChange, 
  routine, 
  onSave, 
  exerciseLibrary 
}: WorkoutEditorProps) {
  const [editedRoutine, setEditedRoutine] = useState<WorkoutRoutine | null>(null);
  const [isNameEditing, setIsNameEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showExerciseLibrary, setShowExerciseLibrary] = useState(false);

  React.useEffect(() => {
    if (routine) {
      setEditedRoutine({ ...routine });
      setIsNameEditing(false);
    }
  }, [routine]);

  if (!editedRoutine) return null;

  const moveExercise = (dragIndex: number, hoverIndex: number) => {
    const draggedExercise = editedRoutine.exercises[dragIndex];
    const newExercises = [...editedRoutine.exercises];
    newExercises.splice(dragIndex, 1);
    newExercises.splice(hoverIndex, 0, draggedExercise);
    
    setEditedRoutine(prev => prev ? { ...prev, exercises: newExercises } : null);
  };

  const addExercise = (libraryExercise: any) => {
    const newExercise: Exercise = {
      id: `${Date.now()}-${Math.random()}`,
      name: libraryExercise.name,
      sets: 3,
      reps: '8-12',
      weight: 'bodyweight',
      completed: false
    };

    setEditedRoutine(prev => prev ? {
      ...prev,
      exercises: [...prev.exercises, newExercise]
    } : null);
    setShowExerciseLibrary(false);
  };

  const editExercise = (index: number, exercise: Exercise) => {
    const newExercises = [...editedRoutine.exercises];
    newExercises[index] = exercise;
    setEditedRoutine(prev => prev ? { ...prev, exercises: newExercises } : null);
  };

  const removeExercise = (index: number) => {
    const newExercises = editedRoutine.exercises.filter((_, i) => i !== index);
    setEditedRoutine(prev => prev ? { ...prev, exercises: newExercises } : null);
  };

  const updateRoutineName = (name: string) => {
    setEditedRoutine(prev => prev ? { ...prev, name } : null);
  };

  const updateRoutineDifficulty = (difficulty: string) => {
    setEditedRoutine(prev => prev ? { ...prev, difficulty } : null);
  };

  const calculateDuration = () => {
    const exerciseCount = editedRoutine.exercises.length;
    const estimatedMinutes = exerciseCount * 8; // Roughly 8 minutes per exercise
    return `${estimatedMinutes} min`;
  };

  const handleSave = () => {
    if (editedRoutine) {
      const updatedRoutine = {
        ...editedRoutine,
        duration: calculateDuration()
      };
      onSave(updatedRoutine);
      onOpenChange(false);
    }
  };

  // Filter exercises for the library
  const filteredExercises = exerciseLibrary.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.primaryMuscles.some((muscle: string) => muscle.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(exerciseLibrary.map(ex => ex.category)))];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5" />
            Edit Workout Routine
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Routine Name and Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Routine Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Name */}
              <div>
                <Label>Routine Name</Label>
                <div className="flex items-center gap-2 mt-1">
                  {!isNameEditing ? (
                    <>
                      <div className="flex-1 font-medium text-lg">{editedRoutine.name}</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsNameEditing(true)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Input
                        value={editedRoutine.name}
                        onChange={(e) => updateRoutineName(e.target.value)}
                        className="flex-1"
                        autoFocus
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsNameEditing(false)}
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <Label>Difficulty</Label>
                <Select 
                  value={editedRoutine.difficulty} 
                  onValueChange={updateRoutineDifficulty}
                >
                  <SelectTrigger className="w-40 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Stats */}
              <div className="flex gap-4">
                <Badge variant="outline">
                  {editedRoutine.exercises.length} exercises
                </Badge>
                <Badge variant="outline">
                  {calculateDuration()}
                </Badge>
                <Badge variant="outline">
                  {editedRoutine.difficulty}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Exercises List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Exercises ({editedRoutine.exercises.length})</CardTitle>
                <Button
                  onClick={() => setShowExerciseLibrary(true)}
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Exercise
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {editedRoutine.exercises.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No exercises yet. Add some exercises to get started!
                </div>
              ) : (
                <DndProvider backend={HTML5Backend}>
                  <div className="space-y-3">
                    {editedRoutine.exercises.map((exercise, index) => (
                      <DraggableExercise
                        key={exercise.id}
                        exercise={exercise}
                        index={index}
                        onMove={moveExercise}
                        onEdit={editExercise}
                        onRemove={removeExercise}
                      />
                    ))}
                  </div>
                </DndProvider>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-600">
            Drag exercises to reorder • Click edit to modify sets/reps/weight
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-gray-900 hover:bg-gray-800 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Exercise Library Dialog */}
        <Dialog open={showExerciseLibrary} onOpenChange={setShowExerciseLibrary}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Exercise Library</DialogTitle>
            </DialogHeader>

            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <Input
                  placeholder="Search exercises..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredExercises.map((exercise) => (
                  <Card key={exercise.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium">{exercise.name}</h3>
                        <Button
                          size="sm"
                          onClick={() => addExercise(exercise)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>Category: {exercise.category}</div>
                        <div>Equipment: {exercise.equipment}</div>
                        <div>Difficulty: {exercise.difficulty}</div>
                      </div>
                      <div className="mt-2">
                        <div className="text-sm text-gray-700">
                          {exercise.primaryMuscles.slice(0, 2).join(', ')}
                          {exercise.primaryMuscles.length > 2 && '...'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredExercises.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No exercises found matching your search criteria.
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}