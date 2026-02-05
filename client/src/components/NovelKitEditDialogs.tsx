import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// Character Archetypes from reference HTML
const CHARACTER_ROLES = [
  "Protagonist", "Antagonist", "Deuteragonist", "Tritagonist", "Supporting", "Minor",
  "Love Interest", "Mentor", "Sidekick", "Comic Relief", "Foil", "Anti-Hero", "Anti-Villain",
  "Hero", "Villain", "Henchman", "Guardian", "Trickster", "Sage", "Innocent", "Everyman",
  "Jester", "Lover", "Rebel", "Explorer", "Creator", "Ruler", "Caregiver", "Magician",
  "Outlaw", "Rival", "Confidant", "False Friend", "Narrator", "Catalyst", "Tempter",
  "Skeptic", "Contagonist", "Guardian Angel", "Damsel in Distress", "Femme Fatale",
  "Byronic Hero", "Tragic Hero", "Scapegoat", "Shapeshifter", "Herald", "Shadow",
  "Threshold Guardian", "Symbolic", "Cameo"
];

interface EditCharacterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character: any;
  onSuccess: () => void;
}

export function EditCharacterDialog({ open, onOpenChange, character, onSuccess }: EditCharacterDialogProps) {
  const [formData, setFormData] = useState({
    name: character?.name || "",
    role: character?.role || "",
    age: character?.age || "",
    occupation: character?.occupation || "",
    physicalDescription: character?.physicalDescription || "",
    personality: character?.personality || "",
    backstory: character?.backstory || "",
    goals: character?.goals || "",
    conflicts: character?.conflicts || "",
  });

  const updateCharacter = trpc.novelKit.characters.update.useMutation({
    onSuccess: () => {
      toast.success("Character updated successfully");
      onSuccess();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Failed to update character: ${error.message}`);
    },
  });

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error("Character name is required");
      return;
    }
    updateCharacter.mutate({
      characterId: character.id,
      ...formData,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Character</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-char-name">Name *</Label>
              <Input
                id="edit-char-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-background border-border text-foreground"
              />
            </div>
            <div>
              <Label htmlFor="edit-char-role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Select role..." />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {CHARACTER_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-char-age">Age</Label>
              <Input
                id="edit-char-age"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="bg-background border-border text-foreground"
              />
            </div>
            <div>
              <Label htmlFor="edit-char-occupation">Occupation</Label>
              <Input
                id="edit-char-occupation"
                value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                className="bg-background border-border text-foreground"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="edit-char-physical">Physical Description</Label>
            <Textarea
              id="edit-char-physical"
              value={formData.physicalDescription}
              onChange={(e) => setFormData({ ...formData, physicalDescription: e.target.value })}
              className="bg-background border-border text-foreground"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="edit-char-personality">Personality</Label>
            <Textarea
              id="edit-char-personality"
              value={formData.personality}
              onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
              className="bg-background border-border text-foreground"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="edit-char-backstory">Backstory</Label>
            <Textarea
              id="edit-char-backstory"
              value={formData.backstory}
              onChange={(e) => setFormData({ ...formData, backstory: e.target.value })}
              className="bg-background border-border text-foreground"
              rows={4}
            />
          </div>
          <div>
            <Label htmlFor="edit-char-goals">Goals</Label>
            <Textarea
              id="edit-char-goals"
              value={formData.goals}
              onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
              className="bg-background border-border text-foreground"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="edit-char-conflicts">Conflicts</Label>
            <Textarea
              id="edit-char-conflicts"
              value={formData.conflicts}
              onChange={(e) => setFormData({ ...formData, conflicts: e.target.value })}
              className="bg-background border-border text-foreground"
              rows={3}
            />
          </div>
          <Button onClick={handleSubmit} className="w-full glow-border" disabled={!formData.name.trim() || updateCharacter.isPending}>
            {updateCharacter.isPending ? "Updating..." : "Update Character"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface EditLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: any;
  onSuccess: () => void;
}

export function EditLocationDialog({ open, onOpenChange, location, onSuccess }: EditLocationDialogProps) {
  const [formData, setFormData] = useState({
    name: location?.name || "",
    type: location?.type || "",
    description: location?.description || "",
    history: location?.history || "",
    culture: location?.culture || "",
    geography: location?.geography || "",
    climate: location?.climate || "",
    population: location?.population || "",
    government: location?.government || "",
    economy: location?.economy || "",
  });

  const updateLocation = trpc.novelKit.locations.update.useMutation({
    onSuccess: () => {
      toast.success("Location updated successfully");
      onSuccess();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Failed to update location: ${error.message}`);
    },
  });

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error("Location name is required");
      return;
    }
    updateLocation.mutate({
      locationId: location.id,
      ...formData,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Location</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-loc-name">Name *</Label>
              <Input
                id="edit-loc-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-background border-border text-foreground"
              />
            </div>
            <div>
              <Label htmlFor="edit-loc-type">Type</Label>
              <Input
                id="edit-loc-type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                placeholder="City, Region, Building, etc."
                className="bg-background border-border text-foreground"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="edit-loc-description">Description</Label>
            <Textarea
              id="edit-loc-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-background border-border text-foreground"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="edit-loc-history">History</Label>
            <Textarea
              id="edit-loc-history"
              value={formData.history}
              onChange={(e) => setFormData({ ...formData, history: e.target.value })}
              className="bg-background border-border text-foreground"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-loc-climate">Climate</Label>
              <Input
                id="edit-loc-climate"
                value={formData.climate}
                onChange={(e) => setFormData({ ...formData, climate: e.target.value })}
                className="bg-background border-border text-foreground"
              />
            </div>
            <div>
              <Label htmlFor="edit-loc-population">Population</Label>
              <Input
                id="edit-loc-population"
                value={formData.population}
                onChange={(e) => setFormData({ ...formData, population: e.target.value })}
                className="bg-background border-border text-foreground"
              />
            </div>
          </div>
          <Button onClick={handleSubmit} className="w-full glow-border" disabled={!formData.name.trim() || updateLocation.isPending}>
            {updateLocation.isPending ? "Updating..." : "Update Location"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface EditWorldElementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  element: any;
  onSuccess: () => void;
}

export function EditWorldElementDialog({ open, onOpenChange, element, onSuccess }: EditWorldElementDialogProps) {
  const [formData, setFormData] = useState({
    name: element?.name || "",
    type: element?.type || "",
    description: element?.description || "",
    rules: element?.rules || "",
    history: element?.history || "",
    significance: element?.significance || "",
  });

  const updateWorldElement = trpc.novelKit.worldElements.update.useMutation({
    onSuccess: () => {
      toast.success("World element updated successfully");
      onSuccess();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Failed to update world element: ${error.message}`);
    },
  });

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error("Element name is required");
      return;
    }
    updateWorldElement.mutate({
      worldElementId: element.id,
      ...formData,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit World Element</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-elem-name">Name *</Label>
              <Input
                id="edit-elem-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-background border-border text-foreground"
              />
            </div>
            <div>
              <Label htmlFor="edit-elem-type">Type</Label>
              <Input
                id="edit-elem-type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                placeholder="Magic, Technology, Creature, etc."
                className="bg-background border-border text-foreground"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="edit-elem-description">Description</Label>
            <Textarea
              id="edit-elem-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-background border-border text-foreground"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="edit-elem-rules">Rules & Limitations</Label>
            <Textarea
              id="edit-elem-rules"
              value={formData.rules}
              onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
              className="bg-background border-border text-foreground"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="edit-elem-history">History</Label>
            <Textarea
              id="edit-elem-history"
              value={formData.history}
              onChange={(e) => setFormData({ ...formData, history: e.target.value })}
              className="bg-background border-border text-foreground"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="edit-elem-significance">Story Significance</Label>
            <Textarea
              id="edit-elem-significance"
              value={formData.significance}
              onChange={(e) => setFormData({ ...formData, significance: e.target.value })}
              className="bg-background border-border text-foreground"
              rows={2}
            />
          </div>
          <Button onClick={handleSubmit} className="w-full glow-border" disabled={!formData.name.trim() || updateWorldElement.isPending}>
            {updateWorldElement.isPending ? "Updating..." : "Update Element"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface EditPlotBeatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plotBeat: any;
  onSuccess: () => void;
}

export function EditPlotBeatDialog({ open, onOpenChange, plotBeat, onSuccess }: EditPlotBeatDialogProps) {
  const [formData, setFormData] = useState({
    beatName: plotBeat?.beatName || "",
    description: plotBeat?.description || "",
    chapter: plotBeat?.chapter || "",
    wordCount: plotBeat?.wordCount?.toString() || "",
  });

  const updatePlotBeat = trpc.novelKit.plotBeats.update.useMutation({
    onSuccess: () => {
      toast.success("Plot beat updated successfully");
      onSuccess();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Failed to update plot beat: ${error.message}`);
    },
  });

  const handleSubmit = () => {
    if (!formData.beatName.trim()) {
      toast.error("Beat name is required");
      return;
    }
    updatePlotBeat.mutate({
      plotBeatId: plotBeat.id,
      beatName: formData.beatName,
      description: formData.description,
      chapter: formData.chapter,
      wordCount: formData.wordCount ? parseInt(formData.wordCount) : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Plot Beat</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-beat-name">Beat Name *</Label>
            <Input
              id="edit-beat-name"
              value={formData.beatName}
              onChange={(e) => setFormData({ ...formData, beatName: e.target.value })}
              placeholder="Opening Image, Catalyst, Midpoint, etc."
              className="bg-background border-border text-foreground"
            />
          </div>
          <div>
            <Label htmlFor="edit-beat-description">Description</Label>
            <Textarea
              id="edit-beat-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-background border-border text-foreground"
              rows={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-beat-chapter">Chapter</Label>
              <Input
                id="edit-beat-chapter"
                value={formData.chapter}
                onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                className="bg-background border-border text-foreground"
              />
            </div>
            <div>
              <Label htmlFor="edit-beat-wordcount">Target Word Count</Label>
              <Input
                id="edit-beat-wordcount"
                type="number"
                value={formData.wordCount}
                onChange={(e) => setFormData({ ...formData, wordCount: e.target.value })}
                className="bg-background border-border text-foreground"
              />
            </div>
          </div>
          <Button onClick={handleSubmit} className="w-full glow-border" disabled={!formData.beatName.trim() || updatePlotBeat.isPending}>
            {updatePlotBeat.isPending ? "Updating..." : "Update Plot Beat"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface EditSceneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scene: any;
  onSuccess: () => void;
}

export function EditSceneDialog({ open, onOpenChange, scene, onSuccess }: EditSceneDialogProps) {
  const [formData, setFormData] = useState({
    title: scene?.title || "",
    chapter: scene?.chapter || "",
    summary: scene?.summary || "",
    goal: scene?.goal || "",
    conflict: scene?.conflict || "",
    outcome: scene?.outcome || "",
  });

  const updateScene = trpc.novelKit.scenes.update.useMutation({
    onSuccess: () => {
      toast.success("Scene updated successfully");
      onSuccess();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Failed to update scene: ${error.message}`);
    },
  });

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast.error("Scene title is required");
      return;
    }
    updateScene.mutate({
      sceneId: scene.id,
      ...formData,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Scene</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-scene-title">Title *</Label>
              <Input
                id="edit-scene-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-background border-border text-foreground"
              />
            </div>
            <div>
              <Label htmlFor="edit-scene-chapter">Chapter</Label>
              <Input
                id="edit-scene-chapter"
                value={formData.chapter}
                onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                className="bg-background border-border text-foreground"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="edit-scene-summary">Summary</Label>
            <Textarea
              id="edit-scene-summary"
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="bg-background border-border text-foreground"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="edit-scene-goal">Goal</Label>
            <Textarea
              id="edit-scene-goal"
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              className="bg-background border-border text-foreground"
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="edit-scene-conflict">Conflict</Label>
            <Textarea
              id="edit-scene-conflict"
              value={formData.conflict}
              onChange={(e) => setFormData({ ...formData, conflict: e.target.value })}
              className="bg-background border-border text-foreground"
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="edit-scene-outcome">Outcome</Label>
            <Textarea
              id="edit-scene-outcome"
              value={formData.outcome}
              onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
              className="bg-background border-border text-foreground"
              rows={2}
            />
          </div>
          <Button onClick={handleSubmit} className="w-full glow-border" disabled={!formData.title.trim() || updateScene.isPending}>
            {updateScene.isPending ? "Updating..." : "Update Scene"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface EditTimelineEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: any;
  onSuccess: () => void;
}

export function EditTimelineEventDialog({ open, onOpenChange, event, onSuccess }: EditTimelineEventDialogProps) {
  const [formData, setFormData] = useState({
    title: event?.title || "",
    date: event?.date || "",
    description: event?.description || "",
    type: event?.type || "",
  });

  const updateTimelineEvent = trpc.novelKit.timeline.update.useMutation({
    onSuccess: () => {
      toast.success("Timeline event updated successfully");
      onSuccess();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Failed to update timeline event: ${error.message}`);
    },
  });

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast.error("Event title is required");
      return;
    }
    updateTimelineEvent.mutate({
      timelineEventId: event.id,
      ...formData,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Timeline Event</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-event-title">Title *</Label>
            <Input
              id="edit-event-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-background border-border text-foreground"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-event-date">Date</Label>
              <Input
                id="edit-event-date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                placeholder="Year 2045, Age of Dragons, etc."
                className="bg-background border-border text-foreground"
              />
            </div>
            <div>
              <Label htmlFor="edit-event-type">Type</Label>
              <Input
                id="edit-event-type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                placeholder="Historical, Story, Character"
                className="bg-background border-border text-foreground"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="edit-event-description">Description</Label>
            <Textarea
              id="edit-event-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-background border-border text-foreground"
              rows={4}
            />
          </div>
          <Button onClick={handleSubmit} className="w-full glow-border" disabled={!formData.title.trim() || updateTimelineEvent.isPending}>
            {updateTimelineEvent.isPending ? "Updating..." : "Update Event"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
