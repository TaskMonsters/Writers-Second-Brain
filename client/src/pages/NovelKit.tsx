/**
 * Neo-Brutalist Dark Academia: Novel Kit Planning Tools
 * Characters, Locations, Scenes, Plot structures
 */

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useData } from "@/contexts/DataContext";
import { MapPin, Plus, Users, BookOpen, Layers, Trophy } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import type { Character, Location, Scene, Plot, NovelKitTab } from "@/lib/types";

export default function NovelKit() {
  const {
    currentProject,
    characters,
    locations,
    scenes,
    plots,
    createCharacter,
    updateCharacter,
    deleteCharacter,
    createLocation,
    updateLocation,
    deleteLocation,
    createScene,
    updateScene,
    deleteScene,
    createPlot,
    updatePlot,
    deletePlot,
  } = useData();
  
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<NovelKitTab>("characters");
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [showNewCharacter, setShowNewCharacter] = useState(false);
  const [showNewLocation, setShowNewLocation] = useState(false);
  const [showNewScene, setShowNewScene] = useState(false);
  const [showNewPlot, setShowNewPlot] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("");

  if (!currentProject) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">No project selected</p>
      </div>
    );
  }

  const handleCreateCharacter = async () => {
    if (!newName.trim()) return;
    await createCharacter(newName);
    setNewName("");
    setShowNewCharacter(false);
  };

  const handleCreateLocation = async () => {
    if (!newName.trim() || !newType.trim()) return;
    await createLocation(newName, newType);
    setNewName("");
    setNewType("");
    setShowNewLocation(false);
  };

  const handleCreateScene = async () => {
    if (!newName.trim()) return;
    await createScene(newName);
    setNewName("");
    setShowNewScene(false);
  };

  const handleCreatePlot = async () => {
    if (!newName.trim() || !newType.trim()) return;
    await createPlot(newType, newName);
    setNewName("");
    setNewType("");
    setShowNewPlot(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-2xl font-bold gradient-text">Manuscript OS</h1>
              <nav className="flex gap-1">
                <Button variant="ghost" onClick={() => setLocation("/dashboard")}>
                  Dashboard
                </Button>
                <Button variant="ghost" className="font-medium">
                  Novel Kit
                </Button>
                <Button variant="ghost" onClick={() => setLocation("/sanctuary")}>
                  Sanctuary
                </Button>
                <Button variant="ghost" onClick={() => setLocation("/achievements")}>
                  <Trophy className="h-4 w-4 mr-2" />
                  Achievements
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-6 py-6">
        <div className="paper-texture bg-card p-6 rounded-lg border border-border mb-6">
          <h2 className="text-3xl font-bold mb-2">Novel Kit</h2>
          <p className="text-muted-foreground">
            Build your story world with detailed planning tools
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as NovelKitTab)}>
          <TabsList className="mb-6">
            <TabsTrigger value="characters">
              <Users className="h-4 w-4 mr-2" />
              Characters
            </TabsTrigger>
            <TabsTrigger value="locations">
              <MapPin className="h-4 w-4 mr-2" />
              Locations
            </TabsTrigger>
            <TabsTrigger value="scenes">
              <BookOpen className="h-4 w-4 mr-2" />
              Scenes
            </TabsTrigger>
            <TabsTrigger value="plot">
              <Layers className="h-4 w-4 mr-2" />
              Plot
            </TabsTrigger>
          </TabsList>

          {/* Characters Tab */}
          <TabsContent value="characters" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Characters ({characters.length})</h3>
              <Button onClick={() => setShowNewCharacter(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Character
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {characters.map((character) => (
                <div
                  key={character.id}
                  onClick={() => setSelectedCharacter(character)}
                  className="paper-texture bg-background p-4 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <h4 className="font-bold text-lg mb-1">{character.name}</h4>
                  {character.role && (
                    <p className="text-sm text-muted-foreground mb-2">{character.role}</p>
                  )}
                  {character.personality && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {character.personality}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Locations Tab */}
          <TabsContent value="locations" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Locations ({locations.length})</h3>
              <Button onClick={() => setShowNewLocation(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Location
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {locations.map((location) => (
                <div
                  key={location.id}
                  onClick={() => setSelectedLocation(location)}
                  className="paper-texture bg-background p-4 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <h4 className="font-bold text-lg mb-1">{location.name}</h4>
                  {location.type && (
                    <p className="text-sm text-muted-foreground mb-2">{location.type}</p>
                  )}
                  {location.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {location.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Scenes Tab */}
          <TabsContent value="scenes" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Scenes ({scenes.length})</h3>
              <Button onClick={() => setShowNewScene(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Scene
              </Button>
            </div>
            
            <div className="space-y-2">
              {scenes.map((scene, idx) => (
                <div
                  key={scene.id}
                  onClick={() => setSelectedScene(scene)}
                  className="paper-texture bg-background p-4 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-sm font-mono text-muted-foreground">
                      {(idx + 1).toString().padStart(2, '0')}
                    </span>
                    <div className="flex-1">
                      <h4 className="font-bold mb-1">{scene.title}</h4>
                      {scene.summary && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {scene.summary}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Plot Tab */}
          <TabsContent value="plot" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Plot Structures ({plots.length})</h3>
              <Button onClick={() => setShowNewPlot(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Plot
              </Button>
            </div>
            
            <div className="space-y-4">
              {plots.map((plot) => (
                <div
                  key={plot.id}
                  onClick={() => setSelectedPlot(plot)}
                  className="paper-texture bg-background p-4 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-lg">{plot.title}</h4>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {plot.type}
                    </span>
                  </div>
                  {plot.description && (
                    <p className="text-sm text-muted-foreground">{plot.description}</p>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* New Character Dialog */}
      <Dialog open={showNewCharacter} onOpenChange={setShowNewCharacter}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Character</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Character Name</label>
              <Input
                placeholder="e.g., Jane Smith"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <Button onClick={handleCreateCharacter} className="w-full">
              Create Character
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Character Dialog */}
      <Dialog open={!!selectedCharacter} onOpenChange={() => setSelectedCharacter(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Character</DialogTitle>
          </DialogHeader>
          {selectedCharacter && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={selectedCharacter.name}
                  onChange={(e) =>
                    setSelectedCharacter({ ...selectedCharacter, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Input
                  placeholder="e.g., Protagonist, Antagonist, Supporting"
                  value={selectedCharacter.role}
                  onChange={(e) =>
                    setSelectedCharacter({ ...selectedCharacter, role: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Personality</label>
                <Textarea
                  placeholder="Describe their personality traits..."
                  value={selectedCharacter.personality || ""}
                  onChange={(e) =>
                    setSelectedCharacter({ ...selectedCharacter, personality: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Background</label>
                <Textarea
                  placeholder="Their history and backstory..."
                  value={selectedCharacter.background || ""}
                  onChange={(e) =>
                    setSelectedCharacter({ ...selectedCharacter, background: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={async () => {
                    await updateCharacter(selectedCharacter);
                    setSelectedCharacter(null);
                  }}
                  className="flex-1"
                >
                  Save Changes
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    await deleteCharacter(selectedCharacter.id);
                    setSelectedCharacter(null);
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Location Dialog */}
      <Dialog open={showNewLocation} onOpenChange={setShowNewLocation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Location</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Location Name</label>
              <Input
                placeholder="e.g., The Ancient Library"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Input
                placeholder="e.g., City, Building, Landmark"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
              />
            </div>
            <Button onClick={handleCreateLocation} className="w-full">
              Create Location
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Location Dialog */}
      <Dialog open={!!selectedLocation} onOpenChange={() => setSelectedLocation(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Location</DialogTitle>
          </DialogHeader>
          {selectedLocation && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={selectedLocation.name}
                  onChange={(e) =>
                    setSelectedLocation({ ...selectedLocation, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Input
                  value={selectedLocation.type}
                  onChange={(e) =>
                    setSelectedLocation({ ...selectedLocation, type: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Describe this location..."
                  value={selectedLocation.description || ""}
                  onChange={(e) =>
                    setSelectedLocation({ ...selectedLocation, description: e.target.value })
                  }
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={async () => {
                    await updateLocation(selectedLocation);
                    setSelectedLocation(null);
                  }}
                  className="flex-1"
                >
                  Save Changes
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    await deleteLocation(selectedLocation.id);
                    setSelectedLocation(null);
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Scene Dialog */}
      <Dialog open={showNewScene} onOpenChange={setShowNewScene}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Scene</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Scene Title</label>
              <Input
                placeholder="e.g., The Opening Battle"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <Button onClick={handleCreateScene} className="w-full">
              Create Scene
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Scene Dialog */}
      <Dialog open={!!selectedScene} onOpenChange={() => setSelectedScene(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Scene</DialogTitle>
          </DialogHeader>
          {selectedScene && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={selectedScene.title}
                  onChange={(e) =>
                    setSelectedScene({ ...selectedScene, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Summary</label>
                <Textarea
                  placeholder="What happens in this scene..."
                  value={selectedScene.summary || ""}
                  onChange={(e) =>
                    setSelectedScene({ ...selectedScene, summary: e.target.value })
                  }
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={async () => {
                    await updateScene(selectedScene);
                    setSelectedScene(null);
                  }}
                  className="flex-1"
                >
                  Save Changes
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    await deleteScene(selectedScene.id);
                    setSelectedScene(null);
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Plot Dialog */}
      <Dialog open={showNewPlot} onOpenChange={setShowNewPlot}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Plot</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Plot Title</label>
              <Input
                placeholder="e.g., The Hero's Journey"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Input
                placeholder="e.g., main, subplot, character-arc"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
              />
            </div>
            <Button onClick={handleCreatePlot} className="w-full">
              Create Plot
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Plot Dialog */}
      <Dialog open={!!selectedPlot} onOpenChange={() => setSelectedPlot(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Plot</DialogTitle>
          </DialogHeader>
          {selectedPlot && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={selectedPlot.title}
                  onChange={(e) =>
                    setSelectedPlot({ ...selectedPlot, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Input
                  value={selectedPlot.type}
                  onChange={(e) =>
                    setSelectedPlot({ ...selectedPlot, type: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Overall plot description..."
                  value={selectedPlot.description || ""}
                  onChange={(e) =>
                    setSelectedPlot({ ...selectedPlot, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={async () => {
                    await updatePlot(selectedPlot);
                    setSelectedPlot(null);
                  }}
                  className="flex-1"
                >
                  Save Changes
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    await deletePlot(selectedPlot.id);
                    setSelectedPlot(null);
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
