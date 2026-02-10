/**
 * Neo-Brutalist Dark Academia: Dashboard with Kanban Board
 * Asymmetric column widths, drag-and-drop tickets
 */

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useData } from "@/contexts/DataContext";
import { BookOpen, GripVertical, Plus, Trophy } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import type { Ticket } from "@/lib/types";

export default function Dashboard() {
  const {
    currentProject,
    sections,
    tickets,
    createSection,
    createTicket,
    updateTicket,
    deleteTicket,
    moveTicket,
  } = useData();
  
  const [, setLocation] = useLocation();
  const [showNewSection, setShowNewSection] = useState(false);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newSectionColor, setNewSectionColor] = useState("#a855f7");
  const [newTicketTitle, setNewTicketTitle] = useState("");
  const [draggedTicket, setDraggedTicket] = useState<string | null>(null);

  if (!currentProject) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">No project selected</p>
      </div>
    );
  }

  const handleCreateSection = async () => {
    if (!newSectionTitle.trim()) return;
    await createSection(newSectionTitle, newSectionColor);
    setNewSectionTitle("");
    setNewSectionColor("#a855f7");
    setShowNewSection(false);
  };

  const handleCreateTicket = async () => {
    if (!newTicketTitle.trim() || !selectedSection) return;
    await createTicket(selectedSection, newTicketTitle);
    setNewTicketTitle("");
    setShowNewTicket(false);
  };

  const handleDragStart = (ticketId: string) => {
    setDraggedTicket(ticketId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (sectionId: string) => {
    if (!draggedTicket) return;
    await moveTicket(draggedTicket, sectionId);
    setDraggedTicket(null);
  };

  const handleUpdateTicket = async () => {
    if (!selectedTicket) return;
    await updateTicket(selectedTicket);
    setSelectedTicket(null);
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
                <Button variant="ghost" className="font-medium">
                  Dashboard
                </Button>
                <Button variant="ghost" onClick={() => setLocation("/novel-kit")}>
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
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNewSection(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Section
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  if (sections.length > 0) {
                    setSelectedSection(sections[0].id);
                    setShowNewTicket(true);
                  }
                }}
                className="bg-gradient-to-r from-primary to-accent"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Ticket
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Project Info */}
      <div className="container mx-auto px-6 py-6">
        <div className="paper-texture bg-card p-6 rounded-lg border border-border mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">{currentProject.title}</h2>
              {currentProject.description && (
                <p className="text-muted-foreground">{currentProject.description}</p>
              )}
            </div>
            <Button variant="ghost" size="icon">
              <BookOpen className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex gap-4 overflow-x-auto pb-6">
          {sections.map((section) => {
            const sectionTickets = tickets.filter(t => t.sectionId === section.id);
            
            return (
              <div
                key={section.id}
                className="flex-shrink-0 w-80"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(section.id)}
              >
                <div className="paper-texture bg-card rounded-lg border border-border overflow-hidden">
                  {/* Section Header */}
                  <div
                    className="p-4 border-b border-border"
                    style={{
                      background: `linear-gradient(135deg, ${section.color}20, ${section.color}10)`,
                      borderLeft: `4px solid ${section.color}`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg">{section.title}</h3>
                      <span className="text-sm text-muted-foreground">
                        {sectionTickets.length}
                      </span>
                    </div>
                  </div>

                  {/* Tickets */}
                  <div className="p-3 space-y-2 min-h-[200px]">
                    {sectionTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        draggable
                        onDragStart={() => handleDragStart(ticket.id)}
                        onClick={() => setSelectedTicket(ticket)}
                        className="paper-texture bg-background p-4 rounded border border-border hover:border-primary/50 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-start gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm mb-1 line-clamp-2">
                              {ticket.title}
                            </h4>
                            {ticket.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {ticket.description}
                              </p>
                            )}
                            {ticket.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {ticket.tags.map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setSelectedSection(section.id);
                        setShowNewTicket(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Ticket
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New Section Dialog */}
      <Dialog open={showNewSection} onOpenChange={setShowNewSection}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Section</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Section Title</label>
              <Input
                placeholder="e.g., In Progress"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={newSectionColor}
                  onChange={(e) => setNewSectionColor(e.target.value)}
                  className="h-10 w-20 rounded border border-border cursor-pointer"
                />
                <Input
                  value={newSectionColor}
                  onChange={(e) => setNewSectionColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <Button onClick={handleCreateSection} className="w-full">
              Create Section
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Ticket Dialog */}
      <Dialog open={showNewTicket} onOpenChange={setShowNewTicket}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Ticket Title</label>
              <Input
                placeholder="e.g., Write Chapter 3"
                value={newTicketTitle}
                onChange={(e) => setNewTicketTitle(e.target.value)}
              />
            </div>
            <Button onClick={handleCreateTicket} className="w-full">
              Create Ticket
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Ticket Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Ticket</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={selectedTicket.title}
                  onChange={(e) =>
                    setSelectedTicket({ ...selectedTicket, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={selectedTicket.description}
                  onChange={(e) =>
                    setSelectedTicket({ ...selectedTicket, description: e.target.value })
                  }
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpdateTicket} className="flex-1">
                  Save Changes
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    await deleteTicket(selectedTicket.id);
                    setSelectedTicket(null);
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
