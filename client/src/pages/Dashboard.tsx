import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Book, Calendar, Lightbulb, Plus, User, Globe, Edit, Sparkles, Trophy, Trash2 } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { MuseChatbotTrigger } from "@/components/MuseChatbot";
import { GlobalNav } from "@/components/GlobalNav";
import { TicketTagsSection } from "@/components/TicketTagsSection";
import { Achievements } from "@/components/Achievements";

type TaskType = "chapter" | "character" | "worldbuilding" | "research" | "editing" | "marketing" | "idea";
type TicketStatus = "backlog" | "research" | "outlining" | "first-draft" | "revisions" | "editing" | "marketing" | "done";

const TASK_TYPE_ICONS: Record<TaskType, any> = {
  chapter: Book,
  character: User,
  worldbuilding: Globe,
  research: Lightbulb,
  editing: Edit,
  marketing: Sparkles,
  idea: Lightbulb,
};

const COLUMNS: { id: TicketStatus; title: string }[] = [
  { id: "backlog", title: "Backlog" },
  { id: "research", title: "Research" },
  { id: "outlining", title: "Outlining" },
  { id: "first-draft", title: "First Draft" },
  { id: "revisions", title: "Revisions" },
  { id: "editing", title: "Editing" },
  { id: "marketing", title: "Marketing" },
  { id: "done", title: "Done" },
];

interface Ticket {
  id: number;
  title: string;
  description: string | null;
  status: TicketStatus;
  taskType: TaskType;
  dueDate: Date | null;
  position: number;
  tags?: Array<{ id: number; tagType: string; tagId: number | null; tagName?: string | null }>;
}

function TicketCard({ ticket, onClick, onDelete }: { ticket: Ticket; onClick: () => void; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: ticket.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = TASK_TYPE_ICONS[ticket.taskType];

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group p-4 mb-3 cursor-grab active:cursor-grabbing modern-card transition-all hover:scale-[1.02]"
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Ticket: ${ticket.title}`}
    >
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground mb-1 truncate">{ticket.title}</h3>
          {ticket.dueDate && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="w-3 h-3" aria-hidden="true" />
              <span>{new Date(ticket.dueDate).toLocaleDateString()}</span>
            </div>
          )}
          {ticket.tags && ticket.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {ticket.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                  title={tag.tagName || `${tag.tagType}${tag.tagId ? ` #${tag.tagId}` : ''}`}
                >
                  {tag.tagType === "character" && "👤"}
                  {tag.tagType === "location" && "📍"}
                  {tag.tagType === "scene" && "🎬"}
                  {tag.tagType === "plotBeat" && "💡"}
                  {tag.tagType === "worldElement" && "✨"}
                  {tag.tagType === "timelineEvent" && "⏰"}
                  <span className="ml-1 truncate max-w-[60px]">{tag.tagName || (tag.tagId ? `#${tag.tagId}` : tag.tagType)}</span>
                </span>
              ))}
              {ticket.tags.length > 3 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                  +{ticket.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label="Delete ticket"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </Card>
  );
}

function KanbanColumn({ status, title, tickets, onTicketClick, onTicketDelete }: {
  status: TicketStatus;
  title: string;
  tickets: Ticket[];
  onTicketClick: (ticket: Ticket) => void;
  onTicketDelete: (ticketId: number) => void;
}) {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <div className="flex-shrink-0 w-80">
      <div className="modern-card p-4 h-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground">{title}</h2>
          <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
            {tickets.length}
          </span>
        </div>
        <SortableContext items={tickets.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div ref={setNodeRef} className="space-y-2 min-h-[200px]">
            {tickets.map(ticket => (
              <TicketCard key={ticket.id} ticket={ticket} onClick={() => onTicketClick(ticket)} onDelete={() => onTicketDelete(ticket.id)} />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTicketTitle, setNewTicketTitle] = useState("");
  const [newTicketDescription, setNewTicketDescription] = useState("");
  const [newTicketType, setNewTicketType] = useState<TaskType>("idea");
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newSectionColor, setNewSectionColor] = useState("#8b5cf6");
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<TaskType | "all">("all");
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Get user's projects
  const { data: projects } = trpc.projects.list.useQuery(undefined, {
    enabled: !!user,
  });

  const currentProject = projects?.[0];

  // Get custom sections for the current project
  const { data: customSections = [] } = trpc.customSections.list.useQuery(
    { projectId: currentProject?.id ?? 0 },
    { enabled: !!currentProject }
  );

  // Get tickets for the current project
  const { data: tickets = [], refetch } = trpc.tickets.list.useQuery(
    { projectId: currentProject?.id ?? 0 },
    { enabled: !!currentProject }
  );

  const updateTicket = trpc.tickets.update.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const deleteTicket = trpc.tickets.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Ticket deleted");
    },
  });

  const handleDeleteTicket = (ticketId: number) => {
    if (confirm("Are you sure you want to delete this ticket?")) {
      deleteTicket.mutate({ ticketId });
    }
  };

  const utils = trpc.useUtils();
  
  const createCustomSection = trpc.customSections.create.useMutation({
    onSuccess: () => {
      utils.customSections.list.invalidate();
      setIsAddSectionOpen(false);
      setNewSectionTitle("");
      setNewSectionColor("#8b5cf6");
      toast.success("Custom section created!");
    },
    onError: (error) => {
      toast.error(`Failed to create section: ${error.message}`);
    },
  });

  const createTicket = trpc.tickets.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsCreateDialogOpen(false);
      setNewTicketTitle("");
      setNewTicketDescription("");
      setNewTicketType("idea");
      toast.success("Ticket created successfully");
    },
  });

  const createProject = trpc.projects.create.useMutation({
    onSuccess: () => {
      utils.projects.list.invalidate();
      setIsProjectDialogOpen(false);
      setNewProjectTitle("");
      setNewProjectDescription("");
      toast.success("Project created successfully!");
    },
  });

  const handleCreateProject = () => {
    if (!newProjectTitle.trim()) return;
    createProject.mutate({
      title: newProjectTitle,
      description: newProjectDescription || undefined,
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeTicket = tickets.find(t => t.id === active.id);
    if (!activeTicket) return;

    const overId = over.id as string;

    // Check if dropped on a standard column
    const overColumn = COLUMNS.find(col => col.id === overId);
    if (overColumn && activeTicket.status !== overColumn.id) {
      updateTicket.mutate({
        ticketId: activeTicket.id,
        status: overColumn.id,
      });
      return;
    }

    // Check if dropped on a custom section
    if (overId.startsWith('custom-')) {
      const newStatus = overId as TicketStatus;
      if (activeTicket.status !== newStatus) {
        updateTicket.mutate({
          ticketId: activeTicket.id,
          status: newStatus,
        });
      }
    }
  };

  const handleCreateTicket = () => {
    if (!currentProject || !newTicketTitle.trim()) return;

    createTicket.mutate({
      projectId: currentProject.id,
      title: newTicketTitle,
      description: newTicketDescription || undefined,
      taskType: newTicketType,
      status: "backlog",
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
          <h2 className="text-2xl font-bold text-foreground mb-4">Welcome to Second Brain for Writers</h2>
          <p className="text-muted-foreground mb-6">
            Create your first novel project to get started with your writing journey.
          </p>
          <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
            <DialogTrigger asChild>
              <Button className="glow-border">
                Create Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="project-title">Project Title</Label>
                  <Input
                    id="project-title"
                    placeholder="My Novel Project"
                    value={newProjectTitle}
                    onChange={(e) => setNewProjectTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
                  />
                </div>
                <div>
                  <Label htmlFor="project-description">Description (Optional)</Label>
                  <Textarea
                    id="project-description"
                    placeholder="A brief description of your novel project..."
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsProjectDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateProject} disabled={!newProjectTitle.trim()}>
                  Create Project
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </Card>
      </div>
    );
  }

  const activeTicket = activeId ? tickets.find(t => t.id === activeId) : null;

  return (
    <div className="min-h-screen bg-background">
      <GlobalNav />
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 
                  className="text-2xl font-bold text-foreground glow-text cursor-pointer hover:opacity-80 transition-opacity" 
                  onClick={() => {
                    const newTitle = prompt('Enter new project name:', currentProject.title);
                    if (newTitle && newTitle.trim()) {
                      // TODO: Add update project mutation
                      toast.success('Project renamed successfully');
                    }
                  }}
                  title="Click to rename project"
                >
                  {currentProject.title}
                </h1>
                <p className="text-sm text-muted-foreground">{currentProject.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Search and Filter */}
              <Input
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 bg-background border-border text-foreground"
              />
              <Select value={filterType} onValueChange={(value) => setFilterType(value as TaskType | "all")}>
                <SelectTrigger className="w-40 bg-background border-border text-foreground">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="idea">Idea</SelectItem>
                  <SelectItem value="chapter">Chapter</SelectItem>
                  <SelectItem value="character">Character</SelectItem>
                  <SelectItem value="worldbuilding">Worldbuilding</SelectItem>
                  <SelectItem value="research">Research</SelectItem>
                  <SelectItem value="editing">Editing</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
              
              <Dialog open={isAchievementsOpen} onOpenChange={setIsAchievementsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2" aria-label="View achievements">
                    <Trophy className="w-4 h-4" aria-hidden="true" />
                    Achievements
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border max-w-6xl max-h-[90vh]">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Your Achievements</DialogTitle>
                  </DialogHeader>
                  {currentProject && <Achievements projectId={currentProject.id} />}
                </DialogContent>
              </Dialog>
              
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="glow-border" aria-label="Create new ticket">
                    <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                    New Ticket
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Create New Ticket</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="ticket-title" className="text-foreground">Title</Label>
                      <Input
                        id="ticket-title"
                        value={newTicketTitle}
                        onChange={(e) => setNewTicketTitle(e.target.value)}
                        placeholder="Enter ticket title"
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ticket-description" className="text-foreground">Description</Label>
                      <Textarea
                        id="ticket-description"
                        value={newTicketDescription}
                        onChange={(e) => setNewTicketDescription(e.target.value)}
                        placeholder="Enter ticket description"
                        className="bg-background border-border text-foreground"
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ticket-type" className="text-foreground">Task Type</Label>
                      <Select value={newTicketType} onValueChange={(value) => setNewTicketType(value as TaskType)}>
                        <SelectTrigger id="ticket-type" className="bg-background border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="idea">Idea</SelectItem>
                          <SelectItem value="chapter">Chapter</SelectItem>
                          <SelectItem value="character">Character</SelectItem>
                          <SelectItem value="worldbuilding">Worldbuilding</SelectItem>
                          <SelectItem value="research">Research</SelectItem>
                          <SelectItem value="editing">Editing</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleCreateTicket} className="w-full glow-border" disabled={!newTicketTitle.trim()}>
                      Create Ticket
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {COLUMNS.map(column => {
              let columnTickets = tickets.filter(t => t.status === column.id);
              
              // Apply search filter
              if (searchQuery.trim()) {
                columnTickets = columnTickets.filter(t => 
                  t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
                );
              }
              
              // Apply type filter
              if (filterType !== "all") {
                columnTickets = columnTickets.filter(t => t.taskType === filterType);
              }
              return (
                <KanbanColumn
                  key={column.id}
                  status={column.id}
                  title={column.title}
                  tickets={columnTickets}
                  onTicketClick={setSelectedTicket}
                  onTicketDelete={handleDeleteTicket}
                />
              );
            })}
            
            {/* Custom Sections */}
            {customSections.map(section => {
              let columnTickets = tickets.filter(t => t.status === `custom-${section.id}`);
              
              // Apply search filter
              if (searchQuery.trim()) {
                columnTickets = columnTickets.filter(t => 
                  t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
                );
              }
              
              // Apply type filter
              if (filterType !== "all") {
                columnTickets = columnTickets.filter(t => t.taskType === filterType);
              }
              return (
                <KanbanColumn
                  key={`custom-${section.id}`}
                  status={`custom-${section.id}` as TicketStatus}
                  title={section.title}
                  tickets={columnTickets}
                  onTicketClick={setSelectedTicket}
                  onTicketDelete={handleDeleteTicket}
                />
              );
            })}
            
            {/* Add New Section Button */}
            <div className="flex-shrink-0 w-80">
              <Button
                variant="outline"
                className="w-full h-full min-h-[200px] border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-all"
                onClick={() => setIsAddSectionOpen(true)}
              >
                <div className="flex flex-col items-center gap-2">
                  <Plus className="w-8 h-8" />
                  <span>New Section</span>
                </div>
              </Button>
            </div>
          </div>
          <DragOverlay>
            {activeTicket && <TicketCard ticket={activeTicket} onClick={() => {}} onDelete={() => {}} />}
          </DragOverlay>
        </DndContext>
      </main>

      {/* Muse AI Chatbot */}
      <MuseChatbotTrigger projectId={currentProject?.id} />

      {/* Ticket Detail Dialog */}
      {selectedTicket && (
        <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
          <DialogContent className="bg-card border-border max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-foreground text-xl">{selectedTicket.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="text-foreground mt-1">{selectedTicket.description || "No description provided"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Task Type</Label>
                  <p className="text-foreground mt-1 capitalize">{selectedTicket.taskType}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <p className="text-foreground mt-1 capitalize">{selectedTicket.status.replace("-", " ")}</p>
                </div>
              </div>
              {selectedTicket.dueDate && (
                <div>
                  <Label className="text-muted-foreground">Due Date</Label>
                  <p className="text-foreground mt-1">{new Date(selectedTicket.dueDate).toLocaleDateString()}</p>
                </div>
              )}
              
              {/* Ticket Tags Section */}
              {currentProject && (
                <TicketTagsSection ticketId={selectedTicket.id} projectId={currentProject.id} />
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Custom Section Dialog */}
      <Dialog open={isAddSectionOpen} onOpenChange={setIsAddSectionOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Create Custom Section</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="section-title" className="text-foreground">Section Title</Label>
              <Input
                id="section-title"
                placeholder="e.g., Beta Reading, Publishing, etc."
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                className="mt-2 bg-background border-border text-foreground"
              />
            </div>
            <div>
              <Label htmlFor="section-color" className="text-foreground">Section Color</Label>
              <div className="flex gap-3 mt-2">
                <Input
                  id="section-color"
                  type="color"
                  value={newSectionColor}
                  onChange={(e) => setNewSectionColor(e.target.value)}
                  className="w-20 h-10 cursor-pointer"
                />
                <Input
                  type="text"
                  value={newSectionColor}
                  onChange={(e) => setNewSectionColor(e.target.value)}
                  placeholder="#8b5cf6"
                  className="flex-1 bg-background border-border text-foreground"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => {
                  if (!newSectionTitle.trim()) {
                    toast.error("Please enter a section title");
                    return;
                  }
                  if (!currentProject) return;
                  createCustomSection.mutate({
                    projectId: currentProject.id,
                    title: newSectionTitle,
                    position: COLUMNS.length + customSections.length,
                    color: newSectionColor,
                  });
                }}
                disabled={createCustomSection.isPending}
                className="flex-1"
              >
                Create Section
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsAddSectionOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
