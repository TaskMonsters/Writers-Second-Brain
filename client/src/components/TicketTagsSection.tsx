import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X, User, MapPin, Film, BookOpen, Globe, Lightbulb } from "lucide-react";
import { toast } from "sonner";

const TAG_TYPE_ICONS = {
  character: User,
  location: MapPin,
  scene: Film,
  plot: BookOpen,
  worldbuilding: Globe,
  research: Lightbulb,
  custom: Plus,
};

const TAG_TYPE_LABELS = {
  character: "Character",
  location: "Location",
  scene: "Scene",
  plot: "Plot Element",
  worldbuilding: "World Building",
  research: "Research",
  custom: "Custom",
};

interface TicketTagsSectionProps {
  ticketId: number;
  projectId: number;
}

export function TicketTagsSection({ ticketId, projectId }: TicketTagsSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedTagType, setSelectedTagType] = useState<string>("");
  const [selectedItemId, setSelectedItemId] = useState<string>("");

  const utils = trpc.useUtils();
  
  // Fetch existing tags
  const { data: tags = [] } = trpc.ticketTags.list.useQuery({ ticketId });
  
  // Fetch Novel Kit items based on selected tag type
  const { data: characters = [] } = trpc.novelKit.characters.list.useQuery(
    { projectId },
    { enabled: selectedTagType === "character" }
  );
  
  const { data: locations = [] } = trpc.novelKit.locations.list.useQuery(
    { projectId },
    { enabled: selectedTagType === "location" }
  );
  
  const { data: scenes = [] } = trpc.novelKit.scenes.list.useQuery(
    { projectId },
    { enabled: selectedTagType === "scene" }
  );
  
  const { data: plotBeats = [] } = trpc.novelKit.plotBeats.list.useQuery(
    { projectId },
    { enabled: selectedTagType === "plot" }
  );

  // Mutations
  const createTag = trpc.ticketTags.create.useMutation({
    onSuccess: () => {
      utils.ticketTags.list.invalidate({ ticketId });
      setIsAdding(false);
      setSelectedTagType("");
      setSelectedItemId("");
      toast.success("Tag added successfully");
    },
    onError: (error) => {
      toast.error(`Failed to add tag: ${error.message}`);
    },
  });

  const deleteTag = trpc.ticketTags.delete.useMutation({
    onSuccess: () => {
      utils.ticketTags.list.invalidate({ ticketId });
      toast.success("Tag removed");
    },
    onError: (error) => {
      toast.error(`Failed to remove tag: ${error.message}`);
    },
  });

  const handleAddTag = () => {
    if (!selectedTagType || !selectedItemId) {
      toast.error("Please select a tag type and item");
      return;
    }

    let tagName = "";
    let tagId: number | undefined;

    if (selectedTagType === "character") {
      const char = characters.find(c => c.id === Number(selectedItemId));
      tagName = char?.name || "";
      tagId = char?.id;
    } else if (selectedTagType === "location") {
      const loc = locations.find(l => l.id === Number(selectedItemId));
      tagName = loc?.name || "";
      tagId = loc?.id;
    } else if (selectedTagType === "scene") {
      const scene = scenes.find(s => s.id === Number(selectedItemId));
      tagName = scene?.title || "";
      tagId = scene?.id;
    } else if (selectedTagType === "plot") {
      const plot = plotBeats.find(p => p.id === Number(selectedItemId));
      tagName = plot?.beatName || "";
      tagId = plot?.id;
    }

    createTag.mutate({
      ticketId,
      tagType: selectedTagType as any,
      tagId,
      tagName,
    });
  };

  const getAvailableItems = () => {
    switch (selectedTagType) {
      case "character":
        return characters.map(c => ({ id: c.id, name: c.name }));
      case "location":
        return locations.map(l => ({ id: l.id, name: l.name }));
      case "scene":
        return scenes.map(s => ({ id: s.id, name: s.title }));
      case "plot":
        return plotBeats.map(p => ({ id: p.id, name: p.beatName }));
      default:
        return [];
    }
  };

  return (
    <div className="border-t border-border pt-4">
      <Label className="text-muted-foreground mb-2 block">Linked Novel Kit Items</Label>
      
      <div className="flex flex-wrap gap-2 mb-3">
        {tags.length === 0 && !isAdding && (
          <p className="text-sm text-muted-foreground">No linked items yet</p>
        )}
        
        {tags.map((tag) => {
          const Icon = TAG_TYPE_ICONS[tag.tagType as keyof typeof TAG_TYPE_ICONS];
          return (
            <Badge
              key={tag.id}
              variant="secondary"
              className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary border-primary/20"
            >
              <Icon className="w-3 h-3" />
              <span>{tag.tagName}</span>
              <button
                onClick={() => deleteTag.mutate({ tagId: tag.id })}
                className="ml-1 hover:text-destructive transition-colors"
                aria-label={`Remove ${tag.tagName} tag`}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          );
        })}
      </div>

      {!isAdding ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAdding(true)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Link Novel Kit Item
        </Button>
      ) : (
        <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
          <div>
            <Label className="text-sm mb-2 block">Item Type</Label>
            <Select value={selectedTagType} onValueChange={(value) => {
              setSelectedTagType(value);
              setSelectedItemId("");
            }}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select type..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TAG_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTagType && selectedTagType !== "custom" && (
            <div>
              <Label className="text-sm mb-2 block">Select Item</Label>
              <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Choose an item..." />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableItems().length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No items available. Create one in Novel Kit first.
                    </div>
                  ) : (
                    getAvailableItems().map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleAddTag}
              disabled={!selectedTagType || !selectedItemId || createTag.isPending}
            >
              Add Tag
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsAdding(false);
                setSelectedTagType("");
                setSelectedItemId("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
