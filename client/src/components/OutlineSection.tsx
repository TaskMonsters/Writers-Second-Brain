import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Plus, Save, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type OutlineMethod = "snowflake" | "beat_mapping" | "mind_mapping" | "synopsis";

interface OutlineSectionProps {
  projectId: number;
}

interface SnowflakeData {
  step1?: string;
  step2?: string;
  step3?: string;
  step4?: string;
  step5?: string;
  step6?: string;
  step7?: string;
  step8?: string;
  step9?: string;
  step10?: string;
}

interface Beat {
  id: string;
  text: string;
  order: number;
}

interface BeatMappingData {
  beats: Beat[];
}

interface MindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  parentId?: string;
}

interface MindMappingData {
  nodes: MindMapNode[];
}

function SortableBeatCard({ beat, onUpdate, onDelete }: { beat: Beat; onUpdate: (text: string) => void; onDelete: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: beat.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-3 bg-card border border-border rounded-lg"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <Input
        value={beat.text}
        onChange={(e) => onUpdate(e.target.value)}
        placeholder="Describe this beat..."
        className="flex-1"
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        className="text-destructive hover:text-destructive"
        aria-label="Delete beat"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

export function OutlineSection({ projectId }: OutlineSectionProps) {
  const [selectedMethod, setSelectedMethod] = useState<OutlineMethod>("snowflake");
  const [currentOutlineId, setCurrentOutlineId] = useState<number | null>(null);
  
  // Snowflake state
  const [snowflakeData, setSnowflakeData] = useState<SnowflakeData>({});
  
  // Beat mapping state
  const [beats, setBeats] = useState<Beat[]>([]);
  
  // Mind mapping state
  const [nodes, setNodes] = useState<MindMapNode[]>([]);
  const [newNodeText, setNewNodeText] = useState("");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [connectMode, setConnectMode] = useState(false);
  const [connectFromId, setConnectFromId] = useState<string | null>(null);
  
  // Synopsis state
  const [synopsis, setSynopsis] = useState("");

  const { data: outlines = [], refetch: refetchOutlines } = trpc.novelKit.outlines.list.useQuery(
    { projectId },
    { enabled: !!projectId }
  );

  const createOutline = trpc.novelKit.outlines.create.useMutation({
    onSuccess: () => {
      refetchOutlines();
      toast.success("Outline created");
    },
    onError: () => {
      toast.error("Failed to create outline");
    },
  });

  const updateOutline = trpc.novelKit.outlines.update.useMutation({
    onSuccess: () => {
      refetchOutlines();
      toast.success("Outline saved");
    },
    onError: () => {
      toast.error("Failed to save outline");
    },
  });

  const deleteOutline = trpc.novelKit.outlines.delete.useMutation({
    onSuccess: () => {
      refetchOutlines();
      toast.success("Outline deleted");
      setCurrentOutlineId(null);
      resetCurrentMethod();
    },
    onError: () => {
      toast.error("Failed to delete outline");
    },
  });

  // Load existing outline for selected method
  useEffect(() => {
    const existingOutline = outlines.find((o) => o.method === selectedMethod);
    if (existingOutline) {
      setCurrentOutlineId(existingOutline.id);
      loadOutlineData(existingOutline.content, selectedMethod);
    } else {
      setCurrentOutlineId(null);
      resetCurrentMethod();
    }
  }, [selectedMethod, outlines]);

  const loadOutlineData = (content: string, method: OutlineMethod) => {
    try {
      const parsed = JSON.parse(content);
      
      if (method === "snowflake") {
        setSnowflakeData(parsed);
      } else if (method === "beat_mapping") {
        setBeats(parsed.beats || []);
      } else if (method === "mind_mapping") {
        setNodes(parsed.nodes || []);
      } else if (method === "synopsis") {
        setSynopsis(typeof parsed === "string" ? parsed : parsed.text || "");
      }
    } catch (e) {
      // If content is not JSON, treat as plain text for synopsis
      if (method === "synopsis") {
        setSynopsis(content);
      }
    }
  };

  const resetCurrentMethod = () => {
    if (selectedMethod === "snowflake") {
      setSnowflakeData({});
    } else if (selectedMethod === "beat_mapping") {
      setBeats([]);
    } else if (selectedMethod === "mind_mapping") {
      setNodes([]);
    } else if (selectedMethod === "synopsis") {
      setSynopsis("");
    }
  };

  const handleSave = async () => {
    let content = "";
    let title = "";

    if (selectedMethod === "snowflake") {
      content = JSON.stringify(snowflakeData);
      title = "Snowflake Outline";
    } else if (selectedMethod === "beat_mapping") {
      content = JSON.stringify({ beats });
      title = "Beat Map";
    } else if (selectedMethod === "mind_mapping") {
      content = JSON.stringify({ nodes });
      title = "Mind Map";
    } else if (selectedMethod === "synopsis") {
      content = JSON.stringify({ text: synopsis });
      title = "Synopsis";
    }

    if (currentOutlineId) {
      await updateOutline.mutateAsync({
        id: currentOutlineId,
        content,
      });
    } else {
      const result = await createOutline.mutateAsync({
        projectId,
        method: selectedMethod,
        title,
        content,
      });
      setCurrentOutlineId(result.id);
    }
  };

  const handleDelete = async () => {
    if (currentOutlineId && confirm("Delete this outline? This cannot be undone.")) {
      await deleteOutline.mutateAsync({ id: currentOutlineId });
    }
  };

  // Beat mapping handlers
  const addBeat = () => {
    const newBeat: Beat = {
      id: `beat-${Date.now()}`,
      text: "",
      order: beats.length,
    };
    setBeats([...beats, newBeat]);
  };

  const updateBeat = (id: string, text: string) => {
    setBeats(beats.map((b) => (b.id === id ? { ...b, text } : b)));
  };

  const deleteBeat = (id: string) => {
    setBeats(beats.filter((b) => b.id !== id));
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setBeats((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Mind mapping handlers
  const addNode = () => {
    if (!newNodeText.trim()) return;

    const newNode: MindMapNode = {
      id: `node-${Date.now()}`,
      text: newNodeText,
      x: Math.random() * 60 + 20, // Random position between 20-80%
      y: Math.random() * 60 + 20,
      parentId: undefined,
    };
    setNodes([...nodes, newNode]);
    setNewNodeText("");
  };

  const deleteNode = (id: string) => {
    // Remove node and any connections to it
    setNodes(nodes.filter((n) => n.id !== id).map(n => 
      n.parentId === id ? { ...n, parentId: undefined } : n
    ));
  };

  const startDrag = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggingNodeId(id);
  };

  const handleDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggingNodeId) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setNodes(nodes.map(node => 
      node.id === draggingNodeId 
        ? { ...node, x: Math.max(0, Math.min(95, x)), y: Math.max(0, Math.min(95, y)) }
        : node
    ));
  };

  const endDrag = () => {
    setDraggingNodeId(null);
  };

  const startConnect = (id: string) => {
    if (connectMode && connectFromId && connectFromId !== id) {
      // Complete connection
      setNodes(nodes.map(node => 
        node.id === id ? { ...node, parentId: connectFromId } : node
      ));
      setConnectMode(false);
      setConnectFromId(null);
      toast.success("Nodes connected");
    } else {
      // Start connection
      setConnectMode(true);
      setConnectFromId(id);
      toast.info("Click another node to connect");
    }
  };

  const cancelConnect = () => {
    setConnectMode(false);
    setConnectFromId(null);
  };

  const disconnectNode = (id: string) => {
    setNodes(nodes.map(node => 
      node.id === id ? { ...node, parentId: undefined } : node
    ));
    toast.success("Node disconnected");
  };

  const snowflakeSteps = [
    { key: "step1", label: "Step 1: One-Sentence Summary", placeholder: "Summarize your novel in one sentence..." },
    { key: "step2", label: "Step 2: One-Paragraph Summary", placeholder: "Expand to a paragraph with setup, conflicts, and ending..." },
    { key: "step3", label: "Step 3: Character Summaries", placeholder: "Write a one-page summary for each major character..." },
    { key: "step4", label: "Step 4: Expand to One Page", placeholder: "Expand each sentence from Step 2 into a full paragraph..." },
    { key: "step5", label: "Step 5: Character Charts", placeholder: "Create detailed character charts with goals, conflicts, epiphanies..." },
    { key: "step6", label: "Step 6: Four-Page Synopsis", placeholder: "Expand Step 4 into a four-page synopsis..." },
    { key: "step7", label: "Step 7: Character Bibles", placeholder: "Expand character charts into full character bibles..." },
    { key: "step8", label: "Step 8: Scene List", placeholder: "List every scene in your novel with one line per scene..." },
    { key: "step9", label: "Step 9: Scene Details", placeholder: "Expand each scene into multi-paragraph descriptions..." },
    { key: "step10", label: "Step 10: First Draft", placeholder: "Write the first draft using your detailed outline..." },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Tabs value={selectedMethod} onValueChange={(v) => setSelectedMethod(v as OutlineMethod)} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="snowflake">Snowflake</TabsTrigger>
            <TabsTrigger value="beat_mapping">Beat Mapping</TabsTrigger>
            <TabsTrigger value="mind_mapping">Mind Map</TabsTrigger>
            <TabsTrigger value="synopsis">Synopsis</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSave} className="glow-border">
          <Save className="w-4 h-4 mr-2" />
          Save Outline
        </Button>
        {currentOutlineId && (
          <Button onClick={handleDelete} variant="destructive">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        )}
      </div>

      {/* Snowflake Method */}
      {selectedMethod === "snowflake" && (
        <div className="space-y-4">
          <Card className="p-4 modern-card">
            <h3 className="font-semibold text-foreground mb-2">Snowflake Method</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Progressively expand your story from a single sentence to a detailed outline through 10 steps.
            </p>
          </Card>
          {snowflakeSteps.map((step) => (
            <Card key={step.key} className="p-4 modern-card">
              <Label className="text-foreground font-semibold mb-2 block">{step.label}</Label>
              <Textarea
                value={snowflakeData[step.key as keyof SnowflakeData] || ""}
                onChange={(e) => setSnowflakeData({ ...snowflakeData, [step.key]: e.target.value })}
                placeholder={step.placeholder}
                rows={4}
                className="resize-none"
              />
            </Card>
          ))}
        </div>
      )}

      {/* Beat Mapping */}
      {selectedMethod === "beat_mapping" && (
        <div className="space-y-4">
          <Card className="p-4 modern-card">
            <h3 className="font-semibold text-foreground mb-2">Beat Mapping</h3>
            <p className="text-sm text-muted-foreground mb-4">
              List key emotional and plot beats in your story. Drag to reorder.
            </p>
          </Card>
          
          <Button onClick={addBeat} className="glow-border">
            <Plus className="w-4 h-4 mr-2" />
            Add Beat
          </Button>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={beats.map((b) => b.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {beats.map((beat) => (
                  <SortableBeatCard
                    key={beat.id}
                    beat={beat}
                    onUpdate={(text) => updateBeat(beat.id, text)}
                    onDelete={() => deleteBeat(beat.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {beats.length === 0 && (
            <Card className="p-8 text-center modern-card border-dashed">
              <p className="text-muted-foreground">No beats yet. Click "Add Beat" to start mapping your story!</p>
            </Card>
          )}
        </div>
      )}

      {/* Mind Mapping */}
      {selectedMethod === "mind_mapping" && (
        <div className="space-y-4">
          <Card className="p-4 modern-card">
            <h3 className="font-semibold text-foreground mb-2">Mind Mapping</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create a visual map of your story ideas. Add nodes, drag to reposition, and click "Connect" to link them.
            </p>
          </Card>

          <div className="flex gap-2">
            <Input
              value={newNodeText}
              onChange={(e) => setNewNodeText(e.target.value)}
              placeholder="Enter idea or concept..."
              onKeyDown={(e) => e.key === "Enter" && addNode()}
            />
            <Button onClick={addNode} className="glow-border">
              <Plus className="w-4 h-4 mr-2" />
              Add Node
            </Button>
            {connectMode && (
              <Button onClick={cancelConnect} variant="outline">
                Cancel Connect
              </Button>
            )}
          </div>

          <Card 
            className="p-6 modern-card min-h-[500px] relative bg-background/50 overflow-hidden"
            onMouseMove={handleDrag}
            onMouseUp={endDrag}
            onMouseLeave={endDrag}
          >
            {/* Draw connection lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              {nodes.map((node) => {
                if (!node.parentId) return null;
                const parent = nodes.find(n => n.id === node.parentId);
                if (!parent) return null;
                
                return (
                  <g key={`line-${node.id}`}>
                    {/* Glow layer */}
                    <line
                      x1={`${parent.x}%`}
                      y1={`${parent.y}%`}
                      x2={`${node.x}%`}
                      y2={`${node.y}%`}
                      stroke="rgb(168, 85, 247)"
                      strokeWidth="6"
                      opacity="0.4"
                      filter="url(#glow)"
                    />
                    {/* Main line */}
                    <line
                      x1={`${parent.x}%`}
                      y1={`${parent.y}%`}
                      x2={`${node.x}%`}
                      y2={`${node.y}%`}
                      stroke="rgb(168, 85, 247)"
                      strokeWidth="3"
                      opacity="0.9"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Render nodes */}
            {nodes.map((node) => (
              <div
                key={node.id}
                className={`absolute p-3 bg-card border-2 rounded-lg cursor-move transition-all select-none ${
                  connectFromId === node.id ? "border-primary ring-2 ring-primary" : 
                  node.parentId ? "border-primary/50" : "border-border"
                }`}
                style={{ 
                  left: `${node.x}%`, 
                  top: `${node.y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: draggingNodeId === node.id ? 10 : 1,
                  minWidth: '120px'
                }}
                onMouseDown={(e) => startDrag(node.id, e)}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 justify-between">
                    <span className="text-sm text-foreground font-medium">{node.text}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNode(node.id);
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        startConnect(node.id);
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      Connect
                    </Button>
                    {node.parentId && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          disconnectNode(node.id);
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        Unlink
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-muted-foreground">Add nodes to start building your mind map</p>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Synopsis Method */}
      {selectedMethod === "synopsis" && (
        <div className="space-y-4">
          <Card className="p-4 modern-card">
            <h3 className="font-semibold text-foreground mb-2">Synopsis Method</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Write a complete summary of your story from beginning to end before starting the novel.
            </p>
          </Card>
          
          <Card className="p-4 modern-card">
            <Textarea
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="Write your complete story synopsis here. Include the beginning, middle, and end. Describe major plot points, character arcs, and the resolution..."
              rows={20}
              className="resize-none font-serif"
            />
          </Card>
        </div>
      )}
    </div>
  );
}
