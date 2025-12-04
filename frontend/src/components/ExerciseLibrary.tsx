import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  Search, 
  Plus, 
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { 
  getExercisesByMuscle, 
  getExercisesByEquipment,
  getBodyParts,
  getEquipmentList,
  searchExercises
} from '../api/exercises_api';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Exercise {
  id: string;
  name: string;
  targetMuscles?: string[];
  target?: string;
  bodyParts?: string[];
  bodyPart?: string;
  equipments?: string[];
  equipment?: string;
  gifUrl: string;
  secondaryMuscles?: string[];
  instructions?: string[];
}

interface ExerciseLibraryProps {
  onAddExercise?: (exercise: Exercise) => void;
  selectedExercises?: string[];
  showDetailsView?: boolean;
}

export function ExerciseLibrary({ onAddExercise, selectedExercises = [], showDetailsView = false }: ExerciseLibraryProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [bodyParts, setBodyParts] = useState<string[]>([]);
  const [equipmentList, setEquipmentList] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedExerciseDetail, setSelectedExerciseDetail] = useState<Exercise | null>(null);

  // Load filter options
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [parts, equipment] = await Promise.all([
          getBodyParts(),
          getEquipmentList()
        ]);
        setBodyParts(parts || []);
        setEquipmentList(equipment || []);
      } catch (error) {
        console.error('Error loading filter options:', error);
      }
    };
    loadFilterOptions();
  }, []);

  // Load exercises based on filters
  useEffect(() => {
    const loadExercises = async () => {
      setLoading(true);
      try {
        let results: Exercise[] = [];

        if (searchQuery) {
          results = await searchExercises(searchQuery);
        } else if (selectedMuscle) {
          results = await getExercisesByMuscle(selectedMuscle);
        } else if (selectedEquipment) {
          results = await getExercisesByEquipment(selectedEquipment);
        } else {
          // Show popular exercises by default (chest, back, legs)
          const popular = await Promise.all([
            getExercisesByMuscle('chest'),
            getExercisesByMuscle('back'),
            getExercisesByMuscle('legs')
          ]);
          results = popular.flat();
        }

        setExercises(results || []);
        // Sort alphabetically by name
        const sorted = (results || []).sort((a, b) => 
          a.name.localeCompare(b.name)
        );
        setFilteredExercises(sorted);
      } catch (error) {
        console.error('Error loading exercises:', error);
        setExercises([]);
        setFilteredExercises([]);
      }
      setLoading(false);
    };

    const timer = setTimeout(loadExercises, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedMuscle, selectedEquipment]);

  return (
    <>
      {showDetailsView ? (
        // Split view: Details on left, exercises list on right
        <div className="flex h-full gap-6 p-6">
          {/* Main Content - Exercise Details */}
          <div className="flex-1 overflow-auto">
            {selectedExerciseDetail ? (
              <div className="space-y-6 pr-4">
                {/* Exercise Header */}
                <div>
                  <h1 className="text-3xl font-bold capitalize">
                    {selectedExerciseDetail.name}
                  </h1>
                </div>

                {/* Exercise Image */}
                {selectedExerciseDetail.gifUrl && (
                  <div className="w-full bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden flex gap-6">
                    
                    {/* Exercise Info Grid */}
                <div className="grid grid-rows-2 gap-4 h-max w-max"> 
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Equipment</p>
                      <p className="text-lg font-semibold capitalize">
                        {selectedExerciseDetail.equipment || selectedExerciseDetail.equipments?.[0] || 'N/A'}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Primary Muscle Group</p>
                      <p className="text-lg font-semibold capitalize">
                        {selectedExerciseDetail.target || selectedExerciseDetail.targetMuscles?.[0] || 'N/A'}
                      </p>
                    </CardContent>
                  </Card>
                </div>
                    
                    <ImageWithFallback
                      src={selectedExerciseDetail.gifUrl}
                      alt={selectedExerciseDetail.name}
                      className="h-max items-end"
                    />
                    
                  </div>
                )}

                

                {/* Secondary Muscles */}
                {selectedExerciseDetail.secondaryMuscles && selectedExerciseDetail.secondaryMuscles.length > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground mb-2">Secondary Muscle Group</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedExerciseDetail.secondaryMuscles.map((muscle, idx) => (
                          <Badge key={idx} variant="secondary">
                            {muscle}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Instructions */}
                {selectedExerciseDetail.instructions && selectedExerciseDetail.instructions.length > 0 && (
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <p className="text-sm font-semibold">Instructions</p>
                      <ol className="space-y-2 list-decimal list-inside">
                        {selectedExerciseDetail.instructions.map((instruction, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground">
                            {instruction}
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Select an exercise from the list to view details</p>
              </div>
            )}
          </div>

          {/* Right Sidebar - Exercise List */}
          <div className="w-80 border-l bg-card rounded-lg p-4 flex flex-col">
            {/* Search and Filters */}
            <div className="space-y-3 mb-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search exercises..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filters Dropdown */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full justify-start text-xs"
                  size="sm"
                >
                  Filters
                </Button>

                {showFilters && (
                  <Card className="p-2">
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs font-medium block mb-1">Body Part</label>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          <Button
                            size="sm"
                            variant={selectedMuscle === '' ? 'default' : 'outline'}
                            onClick={() => setSelectedMuscle('')}
                            className="w-full justify-start text-xs"
                          >
                            All
                          </Button>
                          {bodyParts.slice(0, 8).map((part) => (
                            <Button
                              key={part}
                              size="sm"
                              variant={selectedMuscle === part ? 'default' : 'outline'}
                              onClick={() => {
                                setSelectedMuscle(part);
                                setSearchQuery('');
                              }}
                              className="w-full justify-start text-xs"
                            >
                              {part.charAt(0).toUpperCase() + part.slice(1)}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium block mb-1">Equipment</label>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          <Button
                            size="sm"
                            variant={selectedEquipment === '' ? 'default' : 'outline'}
                            onClick={() => setSelectedEquipment('')}
                            className="w-full justify-start text-xs"
                          >
                            All
                          </Button>
                          {equipmentList.slice(0, 8).map((eq) => (
                            <Button
                              key={eq}
                              size="sm"
                              variant={selectedEquipment === eq ? 'default' : 'outline'}
                              onClick={() => {
                                setSelectedEquipment(eq);
                                setSearchQuery('');
                              }}
                              className="w-full justify-start text-xs"
                            >
                              {eq.charAt(0).toUpperCase() + eq.slice(1)}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>

            {/* Exercise List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : filteredExercises.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No exercises found</p>
              ) : (
                <div className="space-y-2">
                  {filteredExercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      onClick={() => setSelectedExerciseDetail(exercise)}
                      className={`p-3 border rounded-lg cursor-pointer transition-all text-xs ${
                        selectedExerciseDetail?.id === exercise.id
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'hover:bg-accent hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="w-12 h-12 flex-shrink-0 bg-gray-100 dark:bg-gray-900 rounded overflow-hidden">
                          {exercise.gifUrl ? (
                            <ImageWithFallback
                              src={exercise.gifUrl}
                              alt={exercise.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800">
                              <ImageIcon className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold line-clamp-1">{exercise.name}</p>
                          <p className="text-muted-foreground line-clamp-1 text-xs">
                            {exercise.target || exercise.targetMuscles?.[0] || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Original single-view for routine builder
        <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          Filters
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Body Part</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={selectedMuscle === '' ? 'default' : 'outline'}
                  onClick={() => setSelectedMuscle('')}
                >
                  All
                </Button>
                {bodyParts.map((part) => (
                  <Button
                    key={part}
                    size="sm"
                    variant={selectedMuscle === part ? 'default' : 'outline'}
                    onClick={() => {
                      setSelectedMuscle(part);
                      setSearchQuery('');
                    }}
                  >
                    {part.charAt(0).toUpperCase() + part.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Equipment</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={selectedEquipment === '' ? 'default' : 'outline'}
                  onClick={() => setSelectedEquipment('')}
                >
                  All
                </Button>
                {equipmentList.slice(0, 8).map((eq) => (
                  <Button
                    key={eq}
                    size="sm"
                    variant={selectedEquipment === eq ? 'default' : 'outline'}
                    onClick={() => {
                      setSelectedEquipment(eq);
                      setSearchQuery('');
                    }}
                  >
                    {eq.charAt(0).toUpperCase() + eq.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exercise Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredExercises.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            No exercises found. Try a different filter or search term.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredExercises.map((exercise) => (
            <div
              key={exercise.id}
              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent hover:shadow-md transition-all cursor-pointer group"
              onClick={() => {
                if (onAddExercise) {
                  onAddExercise(exercise);
                }
              }}
            >
              {/* Exercise Image Thumbnail */}
              <div className="w-16 h-16 flex-shrink-0 bg-gray-100 dark:bg-gray-900 rounded overflow-hidden">
                {exercise.gifUrl ? (
                  <ImageWithFallback
                    src={exercise.gifUrl}
                    alt={exercise.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800">
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Exercise Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm line-clamp-1">
                  {exercise.name.charAt(0).toUpperCase() + exercise.name.slice(1)}
                </h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {(exercise.targetMuscles?.[0] || exercise.target || 'N/A').slice(0, 15)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {(exercise.equipments?.[0] || exercise.equipment || 'N/A').slice(0, 15)}
                  </Badge>
                </div>
              </div>

              {/* Add Button */}
              <Button
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  if (onAddExercise) {
                    onAddExercise(exercise);
                  }
                }}
                disabled={selectedExercises.includes(exercise.id)}
                size="sm"
                className="flex-shrink-0 gap-2"
                variant={selectedExercises.includes(exercise.id) ? 'outline' : 'default'}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
        </div>
      )}
    </>
  );
}
