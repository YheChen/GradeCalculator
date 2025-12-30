"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus, HelpCircle, Play, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Assignment {
  id: string;
  name: string;
  grade: string;
  weight: string;
}

interface Class {
  id: string;
  name: string;
  assignments: Assignment[];
  finalGoal: string;
}

export default function GradeCalculator() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");

  // Create a new assignment with default values
  const createNewAssignment = (): Assignment => {
    return {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      name: "",
      grade: "",
      weight: "",
    };
  };

  // Create a new class with default values and 4 assignments
  const createNewClass = (index: number): Class => {
    // Create 4 assignments for each class
    const assignments = Array(4)
      .fill(null)
      .map(() => createNewAssignment());

    return {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      name: `Class ${index + 1}`,
      assignments: assignments,
      finalGoal: "",
    };
  };

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedClasses = localStorage.getItem("gradeCalculatorClasses");
    if (savedClasses) {
      const parsedClasses = JSON.parse(savedClasses);
      setClasses(parsedClasses);
      if (parsedClasses.length > 0) {
        setActiveTab(parsedClasses[0].id);
      }
    } else {
      // Initialize with one empty class if no data exists
      const defaultClasses = [createNewClass(0)];
      setClasses(defaultClasses);
      setActiveTab(defaultClasses[0].id);
    }
  }, []);

  // Save data to localStorage whenever classes change
  useEffect(() => {
    if (classes.length > 0) {
      localStorage.setItem("gradeCalculatorClasses", JSON.stringify(classes));
    }
  }, [classes]);

  const addClass = () => {
    const newClass = createNewClass(classes.length);
    setClasses([...classes, newClass]);
    setActiveTab(newClass.id);
  };

  const removeClass = (classId: string) => {
    const updatedClasses = classes.filter((c) => c.id !== classId);
    setClasses(updatedClasses);

    if (updatedClasses.length > 0 && activeTab === classId) {
      setActiveTab(updatedClasses[0].id);
    } else if (updatedClasses.length === 0) {
      const newClass = createNewClass(0);
      setClasses([newClass]);
      setActiveTab(newClass.id);
    }
  };

  const updateClassName = (classId: string, newName: string) => {
    setClasses(
      classes.map((c) => (c.id === classId ? { ...c, name: newName } : c))
    );
  };

  const addAssignment = (classId: string) => {
    setClasses(
      classes.map((c) =>
        c.id === classId
          ? { ...c, assignments: [...c.assignments, createNewAssignment()] }
          : c
      )
    );
  };

  const updateAssignment = (
    classId: string,
    assignmentId: string,
    field: keyof Assignment,
    value: string
  ) => {
    setClasses(
      classes.map((c) =>
        c.id === classId
          ? {
              ...c,
              assignments: c.assignments.map((a) =>
                a.id === assignmentId ? { ...a, [field]: value } : a
              ),
            }
          : c
      )
    );
  };

  const removeAssignment = (classId: string, assignmentId: string) => {
    setClasses(
      classes.map((c) =>
        c.id === classId
          ? {
              ...c,
              assignments: c.assignments.filter((a) => a.id !== assignmentId),
            }
          : c
      )
    );
  };

  const updateFinalGoal = (classId: string, value: string) => {
    setClasses(
      classes.map((c) => (c.id === classId ? { ...c, finalGoal: value } : c))
    );
  };

  // Calculate the total weight of all assignments in a class
  const calculateTotalWeight = (classId: string): number => {
    const currentClass = classes.find((c) => c.id === classId);
    if (!currentClass) return 0;

    return currentClass.assignments.reduce((total, assignment) => {
      const weight = Number.parseFloat(assignment.weight);
      return !isNaN(weight) ? total + weight : total;
    }, 0);
  };

  // Calculate the remaining weight (100% - total weight)
  const calculateRemainingWeight = (classId: string): number => {
    const totalWeight = calculateTotalWeight(classId);
    return Math.max(0, 100 - totalWeight);
  };

  const calculateGrade = (classId: string) => {
    const currentClass = classes.find((c) => c.id === classId);
    if (!currentClass)
      return { currentGrade: 0, neededGrade: 0, totalWeight: 0 };

    let totalPoints = 0;
    let totalWeight = 0;

    currentClass.assignments.forEach((assignment) => {
      const grade = Number.parseFloat(assignment.grade);
      const weight = Number.parseFloat(assignment.weight);

      if (!isNaN(grade) && !isNaN(weight) && weight > 0) {
        totalPoints += (grade * weight) / 100;
        totalWeight += weight;
      }
    });

    const currentGrade = totalWeight > 0 ? totalPoints : 0;

    // Calculate needed grade on remaining assignments to reach goal
    const finalGoal = Number.parseFloat(currentClass.finalGoal);
    const remainingWeight = calculateRemainingWeight(classId);

    let neededGrade = 0;
    if (!isNaN(finalGoal) && remainingWeight > 0) {
      neededGrade = ((finalGoal - currentGrade) / remainingWeight) * 100;
    }

    return {
      currentGrade: Number.parseFloat(currentGrade.toFixed(2)),
      neededGrade: Number.parseFloat(neededGrade.toFixed(2)),
      totalWeight,
      remainingWeight,
    };
  };

  const clearClass = (classId: string) => {
    setClasses(
      classes.map((c) =>
        c.id === classId
          ? {
              ...c,
              assignments: Array(4)
                .fill(null)
                .map(() => createNewAssignment()),
              finalGoal: "",
            }
          : c
      )
    );
  };

  const clearAllClasses = () => {
    const confirmed = window.confirm(
      "Delete all courses? This action cannot be undone."
    );
    if (!confirmed) {
      return;
    }

    const defaultClass = createNewClass(0);
    setClasses([defaultClass]);
    setActiveTab(defaultClass.id);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="destructive"
          size="sm"
          className="bg-red-600 text-white hover:bg-red-700"
          onClick={clearAllClasses}
        >
          Clear All
        </Button>
        <Button variant="outline" size="sm" onClick={addClass}>
          <Plus className="h-4 w-4 mr-1" /> Add Class
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((c) => (
          <Card key={c.id} className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <Input
                  value={c.name}
                  onChange={(e) => updateClassName(c.id, e.target.value)}
                  className="font-semibold text-lg max-w-[200px]"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeClass(c.id)}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="overflow-y-auto max-h-[600px]">
              <div className="grid grid-cols-[1fr_80px_80px_40px] gap-2 mb-2 font-semibold">
                <div>Assignment/Exam</div>
                <div>Grade</div>
                <div className="flex items-center">Weight</div>
                <div></div>
              </div>

              {c.assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="grid grid-cols-[1fr_80px_80px_40px] gap-2 mb-2"
                >
                  <Input
                    value={assignment.name}
                    onChange={(e) =>
                      updateAssignment(
                        c.id,
                        assignment.id,
                        "name",
                        e.target.value
                      )
                    }
                  />
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={assignment.grade}
                    onChange={(e) =>
                      updateAssignment(
                        c.id,
                        assignment.id,
                        "grade",
                        e.target.value
                      )
                    }
                  />
                  <div className="flex items-center">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={assignment.weight}
                      onChange={(e) =>
                        updateAssignment(
                          c.id,
                          assignment.id,
                          "weight",
                          e.target.value
                        )
                      }
                    />
                    <span className="ml-1">%</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAssignment(c.id, assignment.id)}
                    disabled={c.assignments.length <= 1}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button
                variant="link"
                onClick={() => addAssignment(c.id)}
                className="mt-2 mb-4 text-blue-500 p-0"
              >
                + add more rows
              </Button>

              <div className="bg-blue-600 text-white p-2 mb-4 font-semibold text-sm">
                Final Grade Planning
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                <div className="flex items-center">
                  <span className="mr-1">Final Goal</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3 w-3" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>The final grade you want to achieve</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={c.finalGoal}
                  onChange={(e) => updateFinalGoal(c.id, e.target.value)}
                  className="text-sm h-8"
                />

                <div className="flex items-center">
                  <span className="mr-1">Remaining Weight</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3 w-3" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Automatically calculated (100% - total weight)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex items-center">
                  <div className="bg-gray-100 rounded px-2 py-1 w-full text-right">
                    {calculateRemainingWeight(c.id).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                <Button
                  className="bg-green-600 hover:bg-green-700 flex items-center text-xs h-8"
                  onClick={() => {
                    const result = calculateGrade(c.id);
                    alert(
                      `Current Grade: ${result.currentGrade}%\nTotal Weight: ${
                        result.totalWeight
                      }%\nRemaining Weight: ${result.remainingWeight}%\n${
                        result.neededGrade > 0
                          ? `Needed Grade on Remaining Tasks: ${result.neededGrade}%`
                          : ""
                      }`
                    );
                  }}
                >
                  Calculate <Play className="ml-1 h-3 w-3" />
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => clearClass(c.id)}
                  className="text-xs h-8"
                >
                  Clear
                </Button>
              </div>

              {calculateGrade(c.id).currentGrade > 0 && (
                <div className="mt-2 p-3 bg-gray-100 rounded-md text-sm">
                  <h3 className="font-semibold mb-1">Current Results:</h3>
                  <p>Current Grade: {calculateGrade(c.id).currentGrade}%</p>
                  <p>Total Weight: {calculateGrade(c.id).totalWeight}%</p>
                  <p>
                    Remaining Weight:{" "}
                    {calculateRemainingWeight(c.id).toFixed(1)}%
                  </p>
                  {calculateGrade(c.id).neededGrade > 0 && (
                    <p>Needed Grade: {calculateGrade(c.id).neededGrade}%</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
