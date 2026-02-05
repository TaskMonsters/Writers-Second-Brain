import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Plus, User, MapPin, Lightbulb, Film, Sparkles, Clock, MoreVertical, Edit, Trash, FileText, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { MuseChatbotTrigger } from "@/components/MuseChatbot";
import { GlobalNav } from "@/components/GlobalNav";
import { OutlineSection } from "@/components/OutlineSection";
import { EditCharacterDialog, EditLocationDialog, EditWorldElementDialog, EditPlotBeatDialog, EditSceneDialog, EditTimelineEventDialog } from "@/components/NovelKitEditDialogs";
import { CharacterInterviewDialog } from "@/components/CharacterInterviewDialog";
import type { InterviewAnswers } from "@/lib/interviewQuestions";
import { ImageUpload } from "@/components/ImageUpload";

export default function NovelKit() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("characters");

  const { data: projects } = trpc.projects.list.useQuery(undefined, {
    enabled: !!user,
  });

  const currentProject = projects?.[0];

  const { data: characters = [], refetch: refetchCharacters } = trpc.novelKit.characters.list.useQuery(
    { projectId: currentProject?.id ?? 0 },
    { enabled: !!currentProject }
  );

  const { data: locations = [], refetch: refetchLocations } = trpc.novelKit.locations.list.useQuery(
    { projectId: currentProject?.id ?? 0 },
    { enabled: !!currentProject }
  );

  const { data: plotBeats = [], refetch: refetchPlotBeats } = trpc.novelKit.plotBeats.list.useQuery(
    { projectId: currentProject?.id ?? 0 },
    { enabled: !!currentProject }
  );

  const { data: scenes = [], refetch: refetchScenes } = trpc.novelKit.scenes.list.useQuery(
    { projectId: currentProject?.id ?? 0 },
    { enabled: !!currentProject }
  );

  const { data: worldElements = [], refetch: refetchWorldElements } = trpc.novelKit.worldElements.list.useQuery(
    { projectId: currentProject?.id ?? 0 },
    { enabled: !!currentProject }
  );

  const { data: timelineEvents = [], refetch: refetchTimeline } = trpc.novelKit.timeline.list.useQuery(
    { projectId: currentProject?.id ?? 0 },
    { enabled: !!currentProject }
  );

  const [isCharacterDialogOpen, setIsCharacterDialogOpen] = useState(false);
  const [newCharacter, setNewCharacter] = useState({
    name: "",
    role: "",
    genre: "",
    age: "",
    gender: "",
    occupation: "",
    imageUrl: "",
    physicalDescription: "",
    personality: "",
    traits: "",
    background: "",
    motivations: "",
    fears: "",
    strengths: "",
    weaknesses: "",
    conflicts: "",
  });

  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [newLocation, setNewLocation] = useState({
    name: "",
    type: "",
    description: "",
    history: "",
    culture: "",
    geography: "",
    imageUrl: "",
  });

  const [isPlotBeatDialogOpen, setIsPlotBeatDialogOpen] = useState(false);
  const [newPlotBeat, setNewPlotBeat] = useState({
    beatName: "",
    description: "",
    chapter: "",
  });

  const [isWorldElementDialogOpen, setIsWorldElementDialogOpen] = useState(false);
  const [newWorldElement, setNewWorldElement] = useState({
    name: "",
    type: "",
    category: "",
    description: "",
    significance: "",
    rules: "",
    limitations: "",
    imageUrl: "",
  });

  const [isSceneDialogOpen, setIsSceneDialogOpen] = useState(false);
  const [newScene, setNewScene] = useState({
    title: "",
    chapter: "",
    summary: "",
    characters: "",
    location: "",
    purpose: "",
  });

  const [isTimelineDialogOpen, setIsTimelineDialogOpen] = useState(false);
  const [isInterviewDialogOpen, setIsInterviewDialogOpen] = useState(false);
  const [interviewingCharacter, setInterviewingCharacter] = useState<any>(null);

  const updateCharacterInterview = trpc.novelKit.characters.update.useMutation({
    onSuccess: () => {
      refetchCharacters();
      toast.success("Interview saved successfully");
    },
  });
  const [newTimelineEvent, setNewTimelineEvent] = useState({
    title: "",
    date: "",
    description: "",
    significance: "",
  });

  const createCharacter = trpc.novelKit.characters.create.useMutation({
    onSuccess: () => {
      refetchCharacters();
      setIsCharacterDialogOpen(false);
      setNewCharacter({
        name: "",
        role: "",
        genre: "",
        age: "",
        gender: "",
        occupation: "",
        imageUrl: "",
        physicalDescription: "",
        personality: "",
        traits: "",
        background: "",
        motivations: "",
        fears: "",
        strengths: "",
        weaknesses: "",
        conflicts: "",
      });
      toast.success("Character created successfully");
    },
  });

  const createLocation = trpc.novelKit.locations.create.useMutation({
    onSuccess: () => {
      refetchLocations();
      setIsLocationDialogOpen(false);
      setNewLocation({
        name: "",
        type: "",
        description: "",
        history: "",
        culture: "",
        geography: "",
        imageUrl: "",
      });
      toast.success("Location created successfully");
    },
  });

  const createPlotBeat = trpc.novelKit.plotBeats.create.useMutation({
    onSuccess: () => {
      refetchPlotBeats();
      setIsPlotBeatDialogOpen(false);
      setNewPlotBeat({
        beatName: "",
        description: "",
        chapter: "",
      });
      toast.success("Plot beat created successfully");
    },
  });

  const createWorldElement = trpc.novelKit.worldElements.create.useMutation({
    onSuccess: () => {
      refetchWorldElements();
      setIsWorldElementDialogOpen(false);
      setNewWorldElement({
        name: "",
        type: "",
        category: "",
        description: "",
        significance: "",
        rules: "",
        limitations: "",
        imageUrl: "",
      });
      toast.success("World element created successfully");
    },
  });

  const createScene = trpc.novelKit.scenes.create.useMutation({
    onSuccess: () => {
      refetchScenes();
      setIsSceneDialogOpen(false);
      setNewScene({
        title: "",
        chapter: "",
        summary: "",
        characters: "",
        location: "",
        purpose: "",
      });
      toast.success("Scene created successfully");
    },
  });

  const createTimelineEvent = trpc.novelKit.timeline.create.useMutation({
    onSuccess: () => {
      refetchTimeline();
      setIsTimelineDialogOpen(false);
      setNewWorldElement({
        name: "",
        type: "",
        category: "",
        description: "",
        significance: "",
        rules: "",
        limitations: "",
        imageUrl: "",
      });     toast.success("Timeline event created successfully");
    },
  });

  // Delete mutations
  const deleteCharacter = trpc.novelKit.characters.delete.useMutation({
    onSuccess: () => {
      refetchCharacters();
      toast.success("Character deleted successfully");
    },
  });

  const deleteLocation = trpc.novelKit.locations.delete.useMutation({
    onSuccess: () => {
      refetchLocations();
      toast.success("Location deleted successfully");
    },
  });

  const deletePlotBeat = trpc.novelKit.plotBeats.delete.useMutation({
    onSuccess: () => {
      refetchPlotBeats();
      toast.success("Plot beat deleted successfully");
    },
  });

  const deleteWorldElement = trpc.novelKit.worldElements.delete.useMutation({
    onSuccess: () => {
      refetchWorldElements();
      toast.success("World element deleted successfully");
    },
  });

  const deleteScene = trpc.novelKit.scenes.delete.useMutation({
    onSuccess: () => {
      refetchScenes();
      toast.success("Scene deleted successfully");
    },
  });

  const deleteTimelineEvent = trpc.novelKit.timeline.delete.useMutation({
    onSuccess: () => {
      refetchTimeline();
      toast.success("Timeline event deleted successfully");
    },
  });

  // State for delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: string; id: number } | null>(null);

  // Edit dialog states
  const [editCharacterOpen, setEditCharacterOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<any>(null);
  const [editLocationOpen, setEditLocationOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any>(null);
  const [editWorldElementOpen, setEditWorldElementOpen] = useState(false);
  const [editingWorldElement, setEditingWorldElement] = useState<any>(null);
  const [editPlotBeatOpen, setEditPlotBeatOpen] = useState(false);
  const [editingPlotBeat, setEditingPlotBeat] = useState<any>(null);
  const [editSceneOpen, setEditSceneOpen] = useState(false);
  const [editingScene, setEditingScene] = useState<any>(null);
  const [editTimelineEventOpen, setEditTimelineEventOpen] = useState(false);
  const [editingTimelineEvent, setEditingTimelineEvent] = useState<any>(null);

  const handleDeleteConfirm = () => {
    if (!itemToDelete) return;

    switch (itemToDelete.type) {
      case "character":
        deleteCharacter.mutate({ characterId: itemToDelete.id });
        break;
      case "location":
        deleteLocation.mutate({ locationId: itemToDelete.id });
        break;
      case "plotBeat":
        deletePlotBeat.mutate({ plotBeatId: itemToDelete.id });
        break;
      case "worldElement":
        deleteWorldElement.mutate({ worldElementId: itemToDelete.id });
        break;
      case "scene":
        deleteScene.mutate({ sceneId: itemToDelete.id });
        break;
      case "timelineEvent":
        deleteTimelineEvent.mutate({ timelineEventId: itemToDelete.id });
        break;
    }

    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  const handleCreateCharacter = () => {
    if (!currentProject || !newCharacter.name.trim()) return;

    createCharacter.mutate({
      projectId: currentProject.id,
      ...newCharacter,
    });
  };

  const handleCreateLocation = () => {
    if (!currentProject || !newLocation.name.trim()) return;

    createLocation.mutate({
      projectId: currentProject.id,
      ...newLocation,
    });
  };

  const handleCreatePlotBeat = () => {
    if (!currentProject || !newPlotBeat.beatName.trim()) return;

    createPlotBeat.mutate({
      projectId: currentProject.id,
      ...newPlotBeat,
      position: plotBeats.length,
    });
  };

  const handleCreateWorldElement = () => {
    if (!currentProject || !newWorldElement.name.trim()) return;

    createWorldElement.mutate({
      projectId: currentProject.id,
      ...newWorldElement,
    });
  };

  const handleCreateScene = () => {
    if (!currentProject || !newScene.title.trim()) return;

    createScene.mutate({
      projectId: currentProject.id,
      ...newScene,
    });
  };

  const handleCreateTimelineEvent = () => {
    if (!currentProject || !newTimelineEvent.title.trim()) return;

    createTimelineEvent.mutate({
      projectId: currentProject.id,
      ...newTimelineEvent,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    navigate("/");
    return null;
  }

  if (!currentProject) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">No Project Found</h2>
          <p className="text-muted-foreground mb-6">
            Create a project first to use the Novel Kit.
          </p>
          <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <GlobalNav />
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
                aria-label="Back to dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground glow-text">Novel Kit</h1>
                <p className="text-sm text-muted-foreground">Character, worldbuilding, and plot tools</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="inline-flex w-full overflow-x-auto bg-card border border-border [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <TabsTrigger value="characters" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <User className="w-4 h-4 mr-2" aria-hidden="true" />
              Characters
            </TabsTrigger>
            <TabsTrigger value="locations" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <MapPin className="w-4 h-4 mr-2" aria-hidden="true" />
              Locations
            </TabsTrigger>
            <TabsTrigger value="world" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Sparkles className="w-4 h-4 mr-2" aria-hidden="true" />
              World
            </TabsTrigger>
            <TabsTrigger value="plot" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Lightbulb className="w-4 h-4 mr-2" aria-hidden="true" />
              Plot
            </TabsTrigger>
            <TabsTrigger value="scenes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Film className="w-4 h-4 mr-2" aria-hidden="true" />
              Scenes
            </TabsTrigger>
            <TabsTrigger value="timeline" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Clock className="w-4 h-4 mr-2" aria-hidden="true" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="outline" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="w-4 h-4 mr-2" aria-hidden="true" />
              Outline
            </TabsTrigger>
          </TabsList>

          {/* Characters Tab */}
          <TabsContent value="characters" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-foreground">Character Profiles</h2>
              <Dialog open={isCharacterDialogOpen} onOpenChange={setIsCharacterDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="glow-border">
                    <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                    New Character
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Create New Character</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="char-name">Name *</Label>
                        <Input
                          id="char-name"
                          value={newCharacter.name}
                          onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
                          className="bg-background border-border text-foreground"
                        />
                      </div>
                      <div>
                        <Label htmlFor="char-role">Role</Label>
                        <Select value={newCharacter.role} onValueChange={(value) => setNewCharacter({ ...newCharacter, role: value })}>
                          <SelectTrigger className="bg-background border-border text-foreground">
                            <SelectValue placeholder="Select role..." />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            <SelectItem value="Protagonist">Protagonist</SelectItem>
                            <SelectItem value="Antagonist">Antagonist</SelectItem>
                            <SelectItem value="Deuteragonist">Deuteragonist</SelectItem>
                            <SelectItem value="Tritagonist">Tritagonist</SelectItem>
                            <SelectItem value="Supporting">Supporting</SelectItem>
                            <SelectItem value="Minor">Minor</SelectItem>
                            <SelectItem value="Love Interest">Love Interest</SelectItem>
                            <SelectItem value="Mentor">Mentor</SelectItem>
                            <SelectItem value="Sidekick">Sidekick</SelectItem>
                            <SelectItem value="Comic Relief">Comic Relief</SelectItem>
                            <SelectItem value="Foil">Foil</SelectItem>
                            <SelectItem value="Anti-Hero">Anti-Hero</SelectItem>
                            <SelectItem value="Anti-Villain">Anti-Villain</SelectItem>
                            <SelectItem value="Hero">Hero</SelectItem>
                            <SelectItem value="Villain">Villain</SelectItem>
                            <SelectItem value="Henchman">Henchman</SelectItem>
                            <SelectItem value="Guardian">Guardian</SelectItem>
                            <SelectItem value="Trickster">Trickster</SelectItem>
                            <SelectItem value="Sage">Sage</SelectItem>
                            <SelectItem value="Innocent">Innocent</SelectItem>
                            <SelectItem value="Everyman">Everyman</SelectItem>
                            <SelectItem value="Jester">Jester</SelectItem>
                            <SelectItem value="Lover">Lover</SelectItem>
                            <SelectItem value="Rebel">Rebel</SelectItem>
                            <SelectItem value="Explorer">Explorer</SelectItem>
                            <SelectItem value="Creator">Creator</SelectItem>
                            <SelectItem value="Ruler">Ruler</SelectItem>
                            <SelectItem value="Caregiver">Caregiver</SelectItem>
                            <SelectItem value="Magician">Magician</SelectItem>
                            <SelectItem value="Outlaw">Outlaw</SelectItem>
                            <SelectItem value="Rival">Rival</SelectItem>
                            <SelectItem value="Confidant">Confidant</SelectItem>
                            <SelectItem value="False Friend">False Friend</SelectItem>
                            <SelectItem value="Narrator">Narrator</SelectItem>
                            <SelectItem value="Catalyst">Catalyst</SelectItem>
                            <SelectItem value="Tempter">Tempter</SelectItem>
                            <SelectItem value="Skeptic">Skeptic</SelectItem>
                            <SelectItem value="Contagonist">Contagonist</SelectItem>
                            <SelectItem value="Guardian Angel">Guardian Angel</SelectItem>
                            <SelectItem value="Damsel in Distress">Damsel in Distress</SelectItem>
                            <SelectItem value="Femme Fatale">Femme Fatale</SelectItem>
                            <SelectItem value="Byronic Hero">Byronic Hero</SelectItem>
                            <SelectItem value="Tragic Hero">Tragic Hero</SelectItem>
                            <SelectItem value="Scapegoat">Scapegoat</SelectItem>
                            <SelectItem value="Shapeshifter">Shapeshifter</SelectItem>
                            <SelectItem value="Herald">Herald</SelectItem>
                            <SelectItem value="Shadow">Shadow</SelectItem>
                            <SelectItem value="Threshold Guardian">Threshold Guardian</SelectItem>
                            <SelectItem value="Symbolic">Symbolic</SelectItem>
                            <SelectItem value="Cameo">Cameo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="char-genre">Genre</Label>
                        <Input
                          id="char-genre"
                          value={newCharacter.genre}
                          onChange={(e) => setNewCharacter({ ...newCharacter, genre: e.target.value })}
                          placeholder="Fantasy, Sci-Fi, etc."
                          className="bg-background border-border text-foreground"
                        />
                      </div>
                      <div>
                        <Label htmlFor="char-age">Age</Label>
                        <Input
                          id="char-age"
                          value={newCharacter.age}
                          onChange={(e) => setNewCharacter({ ...newCharacter, age: e.target.value })}
                          className="bg-background border-border text-foreground"
                        />
                      </div>
                      <div>
                        <Label htmlFor="char-gender">Gender</Label>
                        <Input
                          id="char-gender"
                          value={newCharacter.gender}
                          onChange={(e) => setNewCharacter({ ...newCharacter, gender: e.target.value })}
                          className="bg-background border-border text-foreground"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="char-occupation">Occupation</Label>
                      <Input
                        id="char-occupation"
                        value={newCharacter.occupation}
                        onChange={(e) => setNewCharacter({ ...newCharacter, occupation: e.target.value })}
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                    <div>
                      <Label>Character Image</Label>
                      <ImageUpload
                        value={newCharacter.imageUrl}
                        onChange={(url) => setNewCharacter({ ...newCharacter, imageUrl: url })}
                        onRemove={() => setNewCharacter({ ...newCharacter, imageUrl: "" })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="char-physical">Physical Description</Label>
                      <Textarea
                        id="char-physical"
                        value={newCharacter.physicalDescription}
                        onChange={(e) => setNewCharacter({ ...newCharacter, physicalDescription: e.target.value })}
                        className="bg-background border-border text-foreground"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="char-personality">Personality</Label>
                      <Textarea
                        id="char-personality"
                        value={newCharacter.personality}
                        onChange={(e) => setNewCharacter({ ...newCharacter, personality: e.target.value })}
                        className="bg-background border-border text-foreground"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="char-traits">Traits (comma-separated)</Label>
                      <Input
                        id="char-traits"
                        value={newCharacter.traits}
                        onChange={(e) => setNewCharacter({ ...newCharacter, traits: e.target.value })}
                        placeholder="Brave, Cunning, Loyal"
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                    <div>
                      <Label htmlFor="char-background">Background</Label>
                      <Textarea
                        id="char-background"
                        value={newCharacter.background}
                        onChange={(e) => setNewCharacter({ ...newCharacter, background: e.target.value })}
                        className="bg-background border-border text-foreground"
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label htmlFor="char-motivations">Motivations</Label>
                      <Textarea
                        id="char-motivations"
                        value={newCharacter.motivations}
                        onChange={(e) => setNewCharacter({ ...newCharacter, motivations: e.target.value })}
                        className="bg-background border-border text-foreground"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="char-fears">Fears</Label>
                      <Textarea
                        id="char-fears"
                        value={newCharacter.fears}
                        onChange={(e) => setNewCharacter({ ...newCharacter, fears: e.target.value })}
                        className="bg-background border-border text-foreground"
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="char-strengths">Strengths</Label>
                        <Textarea
                          id="char-strengths"
                          value={newCharacter.strengths}
                          onChange={(e) => setNewCharacter({ ...newCharacter, strengths: e.target.value })}
                          className="bg-background border-border text-foreground"
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label htmlFor="char-weaknesses">Weaknesses</Label>
                        <Textarea
                          id="char-weaknesses"
                          value={newCharacter.weaknesses}
                          onChange={(e) => setNewCharacter({ ...newCharacter, weaknesses: e.target.value })}
                          className="bg-background border-border text-foreground"
                          rows={2}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="char-conflicts">Conflicts</Label>
                      <Textarea
                        id="char-conflicts"
                        value={newCharacter.conflicts}
                        onChange={(e) => setNewCharacter({ ...newCharacter, conflicts: e.target.value })}
                        className="bg-background border-border text-foreground"
                        rows={3}
                      />
                    </div>
                    <Button onClick={handleCreateCharacter} className="w-full glow-border" disabled={!newCharacter.name.trim()}>
                      Create Character
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {characters.map((character) => (
                <Card key={character.id} className="p-6 modern-card transition-all hover:scale-[1.02]">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">{character.name}</h3>
                      {character.role && (
                        <p className="text-sm text-muted-foreground">{character.role}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" aria-hidden="true" />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setInterviewingCharacter(character);
                              setIsInterviewDialogOpen(true);
                            }}
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Interview
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingCharacter(character);
                              setEditCharacterOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setItemToDelete({ type: "character", id: character.id });
                              setDeleteConfirmOpen(true);
                            }}
                            className="text-destructive"
                          >
                            <Trash className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  {character.age && (
                    <p className="text-sm text-muted-foreground mb-1">Age: {character.age}</p>
                  )}
                  {character.occupation && (
                    <p className="text-sm text-muted-foreground mb-3">{character.occupation}</p>
                  )}
                  {character.personality && (
                    <p className="text-sm text-foreground line-clamp-3">{character.personality}</p>
                  )}
                </Card>
              ))}
              {characters.length === 0 && (
                <Card className="p-8 col-span-full text-center modern-card border-dashed">
                  <User className="w-12 h-12 text-muted-foreground mx-auto mb-3" aria-hidden="true" />
                  <p className="text-muted-foreground">No characters yet. Create your first character profile!</p>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Locations Tab */}
          <TabsContent value="locations" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-foreground">Worldbuilding Locations</h2>
              <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="glow-border">
                    <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                    New Location
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Create New Location</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="loc-name">Name *</Label>
                        <Input
                          id="loc-name"
                          value={newLocation.name}
                          onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                          className="bg-background border-border text-foreground"
                        />
                      </div>
                      <div>
                        <Label htmlFor="loc-type">Type</Label>
                        <Input
                          id="loc-type"
                          value={newLocation.type}
                          onChange={(e) => setNewLocation({ ...newLocation, type: e.target.value })}
                          placeholder="City, Region, Building, etc."
                          className="bg-background border-border text-foreground"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Location Image</Label>
                      <ImageUpload
                        value={newLocation.imageUrl}
                        onChange={(url) => setNewLocation({ ...newLocation, imageUrl: url })}
                        onRemove={() => setNewLocation({ ...newLocation, imageUrl: "" })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="loc-description">Description</Label>
                      <Textarea
                        id="loc-description"
                        value={newLocation.description}
                        onChange={(e) => setNewLocation({ ...newLocation, description: e.target.value })}
                        className="bg-background border-border text-foreground"
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label htmlFor="loc-history">History</Label>
                      <Textarea
                        id="loc-history"
                        value={newLocation.history}
                        onChange={(e) => setNewLocation({ ...newLocation, history: e.target.value })}
                        className="bg-background border-border text-foreground"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="loc-culture">Culture</Label>
                      <Textarea
                        id="loc-culture"
                        value={newLocation.culture}
                        onChange={(e) => setNewLocation({ ...newLocation, culture: e.target.value })}
                        className="bg-background border-border text-foreground"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="loc-geography">Geography</Label>
                      <Textarea
                        id="loc-geography"
                        value={newLocation.geography}
                        onChange={(e) => setNewLocation({ ...newLocation, geography: e.target.value })}
                        className="bg-background border-border text-foreground"
                        rows={3}
                      />
                    </div>
                    <Button onClick={handleCreateLocation} className="w-full glow-border" disabled={!newLocation.name.trim()}>
                      Create Location
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {locations.map((location) => (
                <Card key={location.id} className="p-6 modern-card transition-all hover:scale-[1.02]">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">{location.name}</h3>
                      {location.type && (
                        <p className="text-sm text-muted-foreground">{location.type}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" aria-hidden="true" />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingLocation(location);
                              setEditLocationOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setItemToDelete({ type: "location", id: location.id });
                              setDeleteConfirmOpen(true);
                            }}
                            className="text-destructive"
                          >
                            <Trash className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  {location.description && (
                    <p className="text-sm text-foreground line-clamp-4">{location.description}</p>
                  )}
                </Card>
              ))}
              {locations.length === 0 && (
                <Card className="p-8 col-span-full text-center modern-card border-dashed">
                  <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" aria-hidden="true" />
                  <p className="text-muted-foreground">No locations yet. Start building your world!</p>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* World Elements Tab */}
          <TabsContent value="world" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-foreground">World Elements</h2>
              <Dialog open={isWorldElementDialogOpen} onOpenChange={setIsWorldElementDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="glow-border" aria-label="Add world element">
                    <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                    Add Element
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Add World Element</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="element-name">Name *</Label>
                      <Input
                        id="element-name"
                        value={newWorldElement.name}
                        onChange={(e) => setNewWorldElement({ ...newWorldElement, name: e.target.value })}
                        placeholder="e.g., Magic System, Dragon Species, Technology"
                        className="bg-background border-border"
                      />
                    </div>
                    <div>
                      <Label htmlFor="element-type">Type</Label>
                      <Input
                        id="element-type"
                        value={newWorldElement.type}
                        onChange={(e) => setNewWorldElement({ ...newWorldElement, type: e.target.value })}
                        placeholder="e.g., Magic, Creature, Technology, Organization"
                        className="bg-background border-border"
                      />
                    </div>
                    <div>
                      <Label>Element Image</Label>
                      <ImageUpload
                        value={newWorldElement.imageUrl}
                        onChange={(url) => setNewWorldElement({ ...newWorldElement, imageUrl: url })}
                        onRemove={() => setNewWorldElement({ ...newWorldElement, imageUrl: "" })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="element-description">Description</Label>
                      <Textarea
                        id="element-description"
                        value={newWorldElement.description}
                        onChange={(e) => setNewWorldElement({ ...newWorldElement, description: e.target.value })}
                        placeholder="Describe this element..."
                        rows={4}
                        className="bg-background border-border"
                      />
                    </div>
                    <div>
                      <Label htmlFor="element-rules">Rules/Mechanics</Label>
                      <Textarea
                        id="element-rules"
                        value={newWorldElement.rules}
                        onChange={(e) => setNewWorldElement({ ...newWorldElement, rules: e.target.value })}
                        placeholder="How does it work?"
                        rows={3}
                        className="bg-background border-border"
                      />
                    </div>
                    <div>
                      <Label htmlFor="element-limitations">Limitations/Weaknesses</Label>
                      <Textarea
                        id="element-limitations"
                        value={newWorldElement.limitations}
                        onChange={(e) => setNewWorldElement({ ...newWorldElement, limitations: e.target.value })}
                        placeholder="What are its limits?"
                        rows={3}
                        className="bg-background border-border"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsWorldElementDialogOpen(false)}
                      className="border-border"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateWorldElement}
                      className="glow-border"
                      disabled={!newWorldElement.name.trim()}
                    >
                      Create Element
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {worldElements.map((element) => (
                <Card key={element.id} className="p-6 modern-card transition-all hover:scale-[1.02]">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">{element.name}</h3>
                      {element.type && (
                        <p className="text-sm text-muted-foreground capitalize">{element.type}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" aria-hidden="true" />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingWorldElement(element);
                              setEditWorldElementOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setItemToDelete({ type: "worldElement", id: element.id });
                              setDeleteConfirmOpen(true);
                            }}
                            className="text-destructive"
                          >
                            <Trash className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  {element.description && (
                    <p className="text-sm text-foreground line-clamp-4">{element.description}</p>
                  )}
                </Card>
              ))}
              {worldElements.length === 0 && (
                <Card className="p-8 col-span-full text-center modern-card border-dashed">
                  <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-3" aria-hidden="true" />
                  <p className="text-muted-foreground">No world elements yet. Add magic systems, creatures, or technologies!</p>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Plot Beats Tab */}
          <TabsContent value="plot" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-foreground">Plot Structure</h2>
              <Dialog open={isPlotBeatDialogOpen} onOpenChange={setIsPlotBeatDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="glow-border">
                    <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                    New Plot Beat
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Create New Plot Beat</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="beat-name">Beat Name *</Label>
                      <Input
                        id="beat-name"
                        value={newPlotBeat.beatName}
                        onChange={(e) => setNewPlotBeat({ ...newPlotBeat, beatName: e.target.value })}
                        placeholder="Opening Image, Catalyst, Midpoint, etc."
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                    <div>
                      <Label htmlFor="beat-description">Description</Label>
                      <Textarea
                        id="beat-description"
                        value={newPlotBeat.description}
                        onChange={(e) => setNewPlotBeat({ ...newPlotBeat, description: e.target.value })}
                        className="bg-background border-border text-foreground"
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label htmlFor="beat-chapter">Chapter/Section</Label>
                      <Input
                        id="beat-chapter"
                        value={newPlotBeat.chapter}
                        onChange={(e) => setNewPlotBeat({ ...newPlotBeat, chapter: e.target.value })}
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                    <Button onClick={handleCreatePlotBeat} className="w-full glow-border" disabled={!newPlotBeat.beatName.trim()}>
                      Create Plot Beat
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {plotBeats.map((beat, index) => (
                <Card key={beat.id} className="p-4 modern-card transition-all hover:scale-[1.02]">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-1">{beat.beatName}</h3>
                      {beat.chapter && (
                        <p className="text-sm text-muted-foreground mb-2">{beat.chapter}</p>
                      )}
                      {beat.description && (
                        <p className="text-sm text-foreground">{beat.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Lightbulb className="w-5 h-5 text-primary" aria-hidden="true" />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingPlotBeat(beat);
                              setEditPlotBeatOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setItemToDelete({ type: "plotBeat", id: beat.id });
                              setDeleteConfirmOpen(true);
                            }}
                            className="text-destructive"
                          >
                            <Trash className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Card>
              ))}
              {plotBeats.length === 0 && (
                <Card className="p-8 text-center modern-card border-dashed">
                  <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-3" aria-hidden="true" />
                  <p className="text-muted-foreground">No plot beats yet. Structure your story with key plot points!</p>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Scenes Tab */}
          <TabsContent value="scenes" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-foreground">Scene Tracking</h2>
              <Dialog open={isSceneDialogOpen} onOpenChange={setIsSceneDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="glow-border" aria-label="Add scene">
                    <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                    Add Scene
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Add Scene</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="scene-title">Scene Title *</Label>
                      <Input
                        id="scene-title"
                        value={newScene.title}
                        onChange={(e) => setNewScene({ ...newScene, title: e.target.value })}
                        placeholder="e.g., The Meeting, The Chase, The Revelation"
                        className="bg-background border-border"
                      />
                    </div>
                    <div>
                      <Label htmlFor="scene-chapter">Chapter</Label>
                      <Input
                        id="scene-chapter"
                        value={newScene.chapter}
                        onChange={(e) => setNewScene({ ...newScene, chapter: e.target.value })}
                        placeholder="e.g., Chapter 5"
                        className="bg-background border-border"
                      />
                    </div>
                    <div>
                      <Label htmlFor="scene-summary">Summary</Label>
                      <Textarea
                        id="scene-summary"
                        value={newScene.summary}
                        onChange={(e) => setNewScene({ ...newScene, summary: e.target.value })}
                        placeholder="What happens in this scene?"
                        rows={4}
                        className="bg-background border-border"
                      />
                    </div>
                    <div>
                      <Label htmlFor="scene-characters">Characters</Label>
                      <Input
                        id="scene-characters"
                        value={newScene.characters}
                        onChange={(e) => setNewScene({ ...newScene, characters: e.target.value })}
                        placeholder="Who's in this scene?"
                        className="bg-background border-border"
                      />
                    </div>
                    <div>
                      <Label htmlFor="scene-location">Location</Label>
                      <Input
                        id="scene-location"
                        value={newScene.location}
                        onChange={(e) => setNewScene({ ...newScene, location: e.target.value })}
                        placeholder="Where does it take place?"
                        className="bg-background border-border"
                      />
                    </div>
                    <div>
                      <Label htmlFor="scene-purpose">Purpose</Label>
                      <Textarea
                        id="scene-purpose"
                        value={newScene.purpose}
                        onChange={(e) => setNewScene({ ...newScene, purpose: e.target.value })}
                        placeholder="What's the purpose of this scene?"
                        rows={3}
                        className="bg-background border-border"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsSceneDialogOpen(false)}
                      className="border-border"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateScene}
                      className="glow-border"
                      disabled={!newScene.title.trim()}
                    >
                      Create Scene
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {scenes.map((scene) => (
                <Card key={scene.id} className="p-4 modern-card transition-all hover:scale-[1.02]">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-1">{scene.title}</h3>
                      {scene.chapter && (
                        <p className="text-sm text-muted-foreground mb-2">{scene.chapter}</p>
                      )}
                      {scene.summary && (
                        <p className="text-sm text-foreground line-clamp-2">{scene.summary}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                      <Film className="w-5 h-5 text-primary" aria-hidden="true" />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingScene(scene);
                              setEditSceneOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setItemToDelete({ type: "scene", id: scene.id });
                              setDeleteConfirmOpen(true);
                            }}
                            className="text-destructive"
                          >
                            <Trash className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Card>
              ))}
              {scenes.length === 0 && (
                <Card className="p-8 text-center modern-card border-dashed">
                  <Film className="w-12 h-12 text-muted-foreground mx-auto mb-3" aria-hidden="true" />
                  <p className="text-muted-foreground">No scenes yet. Break down your story scene by scene!</p>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-foreground">Timeline</h2>
              <Dialog open={isTimelineDialogOpen} onOpenChange={setIsTimelineDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="glow-border" aria-label="Add timeline event">
                    <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                    Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Add Timeline Event</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="event-title">Event Title *</Label>
                      <Input
                        id="event-title"
                        value={newTimelineEvent.title}
                        onChange={(e) => setNewTimelineEvent({ ...newTimelineEvent, title: e.target.value })}
                        placeholder="e.g., The Great War, Protagonist's Birth"
                        className="bg-background border-border"
                      />
                    </div>
                    <div>
                      <Label htmlFor="event-date">Date/Time</Label>
                      <Input
                        id="event-date"
                        value={newTimelineEvent.date}
                        onChange={(e) => setNewTimelineEvent({ ...newTimelineEvent, date: e.target.value })}
                        placeholder="e.g., Year 1850, Age 25, Day 1"
                        className="bg-background border-border"
                      />
                    </div>
                    <div>
                      <Label htmlFor="event-description">Description</Label>
                      <Textarea
                        id="event-description"
                        value={newTimelineEvent.description}
                        onChange={(e) => setNewTimelineEvent({ ...newTimelineEvent, description: e.target.value })}
                        placeholder="What happened?"
                        rows={4}
                        className="bg-background border-border"
                      />
                    </div>
                    <div>
                      <Label htmlFor="event-significance">Significance</Label>
                      <Textarea
                        id="event-significance"
                        value={newTimelineEvent.significance}
                        onChange={(e) => setNewTimelineEvent({ ...newTimelineEvent, significance: e.target.value })}
                        placeholder="Why is this event important?"
                        rows={3}
                        className="bg-background border-border"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsTimelineDialogOpen(false)}
                      className="border-border"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateTimelineEvent}
                      className="glow-border"
                      disabled={!newTimelineEvent.title.trim()}
                    >
                      Create Event
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {timelineEvents.length === 0 ? (
              <Card className="p-8 text-center modern-card border-dashed">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" aria-hidden="true" />
                <p className="text-muted-foreground">No timeline events yet. Create a chronology for your story!</p>
              </Card>
            ) : (
              <div className="relative">
                <div className="overflow-x-auto pb-8">
                  <div className="inline-flex items-start gap-8 min-w-full px-4 py-8">
                    {timelineEvents
                      .sort((a, b) => {
                        // Sort by date if it's a number, otherwise by title
                        const dateA = parseInt(a.date || '0') || 0;
                        const dateB = parseInt(b.date || '0') || 0;
                        return dateA - dateB;
                      })
                      .map((event, index) => (
                        <div key={event.id} className="relative flex flex-col items-center min-w-[280px]">
                          {/* Timeline marker */}
                          <div className="relative z-10 flex flex-col items-center">
                            <div className="w-4 h-4 rounded-full bg-primary border-4 border-background shadow-lg" />
                            {event.date && (
                              <div className="mt-2 text-2xl font-bold text-primary">
                                {event.date}
                              </div>
                            )}
                          </div>
                          
                          {/* Connecting line */}
                          {index < timelineEvents.length - 1 && (
                            <div className="absolute top-2 left-1/2 w-[calc(100%+2rem)] h-0.5 bg-border" style={{ transform: 'translateX(0)' }} />
                          )}
                          
                          {/* Event card */}
                          <Card className="mt-4 p-4 modern-card w-full relative group">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="text-base font-semibold text-foreground">{event.title}</h3>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreVertical className="w-3 h-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setEditingTimelineEvent(event);
                                      setEditTimelineEventOpen(true);
                                    }}
                                  >
                                    <Edit className="w-3 h-3 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setItemToDelete({ type: "timelineEvent", id: event.id });
                                      setDeleteConfirmOpen(true);
                                    }}
                                    className="text-destructive"
                                  >
                                    <Trash className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            {event.description && (
                              <p className="text-sm text-muted-foreground line-clamp-3">{event.description}</p>
                            )}

                          </Card>
                        </div>
                      ))}
                  </div>
                </div>
                
                {/* Scroll hint */}
                <div className="absolute bottom-0 right-0 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
                  ← Scroll horizontally →
                </div>
              </div>
            )}
          </TabsContent>

          {/* Outline Tab */}
          <TabsContent value="outline" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-foreground">Outline</h2>
            </div>
            {currentProject && <OutlineSection projectId={currentProject.id} />}
          </TabsContent>
        </Tabs>
      </div>

      {/* Muse AI Chatbot */}
      <MuseChatbotTrigger projectId={currentProject?.id} />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This action cannot be undone. This will permanently delete this item from your Novel Kit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialogs */}
      <EditCharacterDialog
        open={editCharacterOpen}
        onOpenChange={setEditCharacterOpen}
        character={editingCharacter}
        onSuccess={refetchCharacters}
      />
      <EditLocationDialog
        open={editLocationOpen}
        onOpenChange={setEditLocationOpen}
        location={editingLocation}
        onSuccess={refetchLocations}
      />
      <EditWorldElementDialog
        open={editWorldElementOpen}
        onOpenChange={setEditWorldElementOpen}
        element={editingWorldElement}
        onSuccess={refetchWorldElements}
      />
      <EditPlotBeatDialog
        open={editPlotBeatOpen}
        onOpenChange={setEditPlotBeatOpen}
        plotBeat={editingPlotBeat}
        onSuccess={refetchPlotBeats}
      />
      <EditSceneDialog
        open={editSceneOpen}
        onOpenChange={setEditSceneOpen}
        scene={editingScene}
        onSuccess={refetchScenes}
      />
      <EditTimelineEventDialog
        open={editTimelineEventOpen}
        onOpenChange={setEditTimelineEventOpen}
        event={editingTimelineEvent}
        onSuccess={refetchTimeline}
      />
      {/* Character Interview Dialog */}
      <CharacterInterviewDialog
        open={isInterviewDialogOpen}
        onOpenChange={setIsInterviewDialogOpen}
        characterName={interviewingCharacter?.name || ""}
        initialAnswers={interviewingCharacter?.interview || {}}
        onSave={(answers: InterviewAnswers) => {
          if (interviewingCharacter && currentProject) {
            updateCharacterInterview.mutate({
              characterId: interviewingCharacter.id,
              interview: answers as any,
            });
          }
        }}
      />
    </div>
  );
}
