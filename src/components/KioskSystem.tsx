import { useState, useRef, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Clock, User, BookOpen, MapPin, Search, X, GraduationCap } from "lucide-react";
import fabinhsLogo from "@/assets/fabinhs-logo.jpg";
import { roomSchedules, getRoomSchedule, DAYS, TIME_SLOTS, type RoomSchedule } from "@/data/scheduleData";

interface State {
  building: string;
  floor: number;
  zoom: number;
  tx: number;
  ty: number;
}

interface SearchResult {
  code: string;
  building: string;
  floor: number;
  roomIdx: number;
  teacher?: string;
  subject?: string;
}

// Mock teacher schedule data
const teacherSchedules: Record<string, { teacher: string; subject: string; schedule: { day: string; time: string }[] }> = {
  "B1-101": { teacher: "Ms. Maria Santos", subject: "Mathematics", schedule: [{ day: "Mon-Fri", time: "8:00 AM - 9:00 AM" }] },
  "B1-102": { teacher: "Mr. Juan Reyes", subject: "Science", schedule: [{ day: "Mon-Fri", time: "9:00 AM - 10:00 AM" }] },
  "B1-103": { teacher: "Mrs. Ana Cruz", subject: "English", schedule: [{ day: "Mon-Fri", time: "10:00 AM - 11:00 AM" }] },
  "B1-104": { teacher: "Mr. Pedro Garcia", subject: "Filipino", schedule: [{ day: "Mon-Fri", time: "11:00 AM - 12:00 PM" }] },
  "B1-105": { teacher: "Ms. Rosa Mendoza", subject: "Social Studies", schedule: [{ day: "Mon-Fri", time: "1:00 PM - 2:00 PM" }] },
  "B2-201": { teacher: "Mr. Carlos Diaz", subject: "Physics", schedule: [{ day: "Mon-Fri", time: "8:00 AM - 9:00 AM" }] },
  "B2-202": { teacher: "Ms. Elena Torres", subject: "Chemistry", schedule: [{ day: "Mon-Fri", time: "9:00 AM - 10:00 AM" }] },
  "B2-203": { teacher: "Mr. Ramon Lopez", subject: "Biology", schedule: [{ day: "Mon-Fri", time: "10:00 AM - 11:00 AM" }] },
  "B2-204": { teacher: "Mrs. Sofia Ramos", subject: "History", schedule: [{ day: "Mon-Fri", time: "11:00 AM - 12:00 PM" }] },
  "B2-205": { teacher: "Mr. Luis Fernandez", subject: "Geography", schedule: [{ day: "Mon-Fri", time: "1:00 PM - 2:00 PM" }] },
  "B3-301": { teacher: "Ms. Carmen Flores", subject: "Computer Science", schedule: [{ day: "Mon-Fri", time: "8:00 AM - 9:00 AM" }] },
  "B3-302": { teacher: "Mr. Miguel Castro", subject: "P.E.", schedule: [{ day: "Mon-Fri", time: "9:00 AM - 10:00 AM" }] },
  "B3-303": { teacher: "Mrs. Gloria Morales", subject: "Arts", schedule: [{ day: "Mon-Fri", time: "10:00 AM - 11:00 AM" }] },
  "B3-304": { teacher: "Mr. Ricardo Jimenez", subject: "Music", schedule: [{ day: "Mon-Fri", time: "11:00 AM - 12:00 PM" }] },
  "B3-305": { teacher: "Ms. Patricia Vargas", subject: "Values Education", schedule: [{ day: "Mon-Fri", time: "1:00 PM - 2:00 PM" }] },
  "B4-401": { teacher: "Mr. Antonio Ruiz", subject: "Calculus", schedule: [{ day: "Mon-Fri", time: "8:00 AM - 9:00 AM" }] },
  "B4-402": { teacher: "Ms. Isabel Navarro", subject: "Statistics", schedule: [{ day: "Mon-Fri", time: "9:00 AM - 10:00 AM" }] },
  "B4-403": { teacher: "Mr. Francisco Herrera", subject: "Economics", schedule: [{ day: "Mon-Fri", time: "10:00 AM - 11:00 AM" }] },
  "B4-404": { teacher: "Mrs. Teresa Medina", subject: "Accounting", schedule: [{ day: "Mon-Fri", time: "11:00 AM - 12:00 PM" }] },
  "B4-405": { teacher: "Mr. Jorge Romero", subject: "Business", schedule: [{ day: "Mon-Fri", time: "1:00 PM - 2:00 PM" }] },
};

// Building positions for zoom-to-building feature
const buildingPositions: Record<string, { x: number; y: number; w: number; h: number }> = {
  b1: { x: 300, y: 300, w: 220, h: 500 },
  b2: { x: 900, y: 300, w: 260, h: 500 },
  b3: { x: 1450, y: 300, w: 240, h: 500 },
  b4: { x: 350, y: 80, w: 1300, h: 120 },
};

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;
const SVG_WIDTH = 2000;
const SVG_HEIGHT = 1200;

const KioskSystem = () => {
  const [state, setState] = useState<State>({ building: 'b1', floor: 1, zoom: 1, tx: 0, ty: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [showRoomDialog, setShowRoomDialog] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [highlightedRooms, setHighlightedRooms] = useState<Set<string>>(new Set());
  
  const svgRef = useRef<SVGSVGElement>(null);
  const mapWrapRef = useRef<HTMLDivElement>(null);
  const panStartRef = useRef({ x: 0, y: 0 });
  const lastTranslateRef = useRef({ tx: 0, ty: 0 });

  // Generate all rooms for search
  const allRooms = useMemo(() => {
    const rooms: SearchResult[] = [];
    const buildingIds = ['b1', 'b2', 'b3', 'b4'];
    buildingIds.forEach(bid => {
      for (let floor = 1; floor <= 4; floor++) {
        for (let idx = 1; idx <= 5; idx++) {
          const code = `${bid.toUpperCase()}-${floor * 100 + idx}`;
          const schedule = teacherSchedules[code];
          rooms.push({
            code,
            building: bid,
            floor,
            roomIdx: idx,
            teacher: schedule?.teacher,
            subject: schedule?.subject,
          });
        }
      }
    });
    return rooms;
  }, []);

  // Search results based on query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return allRooms.filter(room => 
      room.code.toLowerCase().includes(query) ||
      room.teacher?.toLowerCase().includes(query) ||
      room.subject?.toLowerCase().includes(query)
    ).slice(0, 10);
  }, [searchQuery, allRooms]);

  // Handle search and highlight
  const handleSearch = useCallback(() => {
    if (searchResults.length > 0) {
      const codes = new Set(searchResults.map(r => r.code));
      setHighlightedRooms(codes);
      // Navigate to first result
      const first = searchResults[0];
      setState(prev => ({ ...prev, building: first.building, floor: first.floor }));
      zoomToBuilding(first.building);
    }
  }, [searchResults]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setHighlightedRooms(new Set());
  }, []);

  const roomNumberFor = (floor: number, idx: number) => (floor * 100) + idx;
  const roomCode = (bid: string, floor: number, idx: number) => 
    `${bid.toUpperCase()}-${roomNumberFor(floor, idx)}`;

  const buildings = [
    { value: 'b1', label: 'Building 1' },
    { value: 'b2', label: 'Building 2' },
    { value: 'b3', label: 'Building 3' },
    { value: 'b4', label: 'Building 4' },
  ];

  const clampTranslate = useCallback((tx: number, ty: number, zoom: number) => {
    if (!mapWrapRef.current) return { tx, ty };
    const container = mapWrapRef.current.getBoundingClientRect();
    const scaledW = SVG_WIDTH * zoom * (container.width / SVG_WIDTH);
    const scaledH = SVG_HEIGHT * zoom * (container.height / SVG_HEIGHT);
    
    const maxTx = Math.max(0, scaledW - container.width);
    const maxTy = Math.max(0, scaledH - container.height);
    
    return {
      tx: Math.max(-maxTx, Math.min(maxTx / 2, tx)),
      ty: Math.max(-maxTy, Math.min(maxTy / 2, ty)),
    };
  }, []);

  const setZoom = useCallback((newZoom: number) => {
    const z = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
    setState(prev => {
      const clamped = clampTranslate(prev.tx, prev.ty, z);
      return { ...prev, zoom: z, ...clamped };
    });
  }, [clampTranslate]);

  const zoomToBuilding = useCallback((buildingId: string) => {
    const pos = buildingPositions[buildingId];
    if (!pos || !mapWrapRef.current) return;
    
    const container = mapWrapRef.current.getBoundingClientRect();
    
    // Calculate zoom to fit building with padding
    const paddingFactor = 0.7; // 70% of container for the building
    const zoomX = (container.width * paddingFactor) / pos.w;
    const zoomY = (container.height * paddingFactor) / pos.h;
    const targetZoom = Math.min(Math.max(zoomX, zoomY), 2.5); // Cap at 2.5x
    
    // Get SVG's actual rendered dimensions
    const svgAspect = SVG_WIDTH / SVG_HEIGHT;
    const containerAspect = container.width / container.height;
    
    let svgRenderedWidth: number, svgRenderedHeight: number;
    if (containerAspect > svgAspect) {
      svgRenderedHeight = container.height;
      svgRenderedWidth = svgRenderedHeight * svgAspect;
    } else {
      svgRenderedWidth = container.width;
      svgRenderedHeight = svgRenderedWidth / svgAspect;
    }
    
    // Calculate building center in screen coordinates
    const scaleX = svgRenderedWidth / SVG_WIDTH;
    const scaleY = svgRenderedHeight / SVG_HEIGHT;
    
    const buildingCenterX = (pos.x + pos.w / 2) * scaleX;
    const buildingCenterY = (pos.y + pos.h / 2) * scaleY;
    
    // Calculate translation to center building
    const offsetX = (container.width - svgRenderedWidth) / 2;
    const offsetY = (container.height - svgRenderedHeight) / 2;
    
    const tx = (container.width / 2) - (buildingCenterX + offsetX) * targetZoom;
    const ty = (container.height / 2) - (buildingCenterY + offsetY) * targetZoom;
    
    setState(prev => ({ 
      ...prev, 
      building: buildingId, 
      floor: prev.building === buildingId ? prev.floor : 1,
      zoom: targetZoom,
      tx,
      ty
    }));
  }, []);

  const handleWheel = useCallback((ev: React.WheelEvent) => {
    ev.preventDefault();
    ev.stopPropagation();
    const delta = ev.deltaY < 0 ? 1.1 : 1/1.1;
    setZoom(state.zoom * delta);
  }, [state.zoom, setZoom]);

  const handlePointerDown = useCallback((ev: React.PointerEvent) => {
    if (ev.button && ev.button !== 0) return;
    ev.preventDefault();
    setIsPanning(true);
    panStartRef.current = { x: ev.clientX, y: ev.clientY };
    lastTranslateRef.current = { tx: state.tx, ty: state.ty };
    (ev.target as HTMLElement).setPointerCapture(ev.pointerId);
  }, [state.tx, state.ty]);

  const handlePointerMove = useCallback((ev: React.PointerEvent) => {
    if (!isPanning) return;
    ev.preventDefault();
    const dx = ev.clientX - panStartRef.current.x;
    const dy = ev.clientY - panStartRef.current.y;
    const newTx = lastTranslateRef.current.tx + dx;
    const newTy = lastTranslateRef.current.ty + dy;
    const clamped = clampTranslate(newTx, newTy, state.zoom);
    setState(prev => ({ ...prev, ...clamped }));
  }, [isPanning, state.zoom, clampTranslate]);

  const handlePointerUp = useCallback((ev: React.PointerEvent) => {
    if (isPanning) {
      (ev.target as HTMLElement).releasePointerCapture(ev.pointerId);
    }
    setIsPanning(false);
  }, [isPanning]);

  const handleRoomClick = (bid: string, floor: number, idx: number, ev: React.MouseEvent) => {
    ev.stopPropagation();
    const code = roomCode(bid, floor, idx);
    setSelectedRoom({ bid, floor, idx, code });
    setShowRoomDialog(true);
  };

  const renderRooms = () => {
    const rooms = [];
    const roomsCount = 5;

    if (state.building === 'b4') {
      // Horizontal rooms for Building 4
      const gap = 18, roomW = 230, ry = 100;
      const baseX = 400;
      for (let i = 0; i < roomsCount; i++) {
        const rx = baseX + i * (roomW + gap);
        const code = roomCode(state.building, state.floor, i + 1);
        const isHighlighted = highlightedRooms.has(code);
        rooms.push(
          <g key={`room-${i}`} className={isHighlighted ? 'animate-pulse-glow' : ''}>
            <rect
              x={rx} y={ry} width={roomW} height={40}
              fill={isHighlighted ? "#fef3c7" : "url(#roomGradient)"}
              stroke={isHighlighted ? "#22c55e" : "#6c757d"}
              strokeWidth={isHighlighted ? 6 : 3}
              rx="4"
              filter={isHighlighted ? "url(#searchGlow)" : "url(#shadow)"}
              className="cursor-pointer hover:opacity-80 transition-all"
              onClick={(ev) => handleRoomClick(state.building, state.floor, i + 1, ev)}
            />
            <text x={rx + roomW/2} y={ry + 20} className="text-[16px] font-bold" fill="#000000" textAnchor="middle" dominantBaseline="middle">
              Room {roomNumberFor(state.floor, i + 1)}
            </text>
          </g>
        );
      }
    } else {
      // Vertical rooms for Buildings 1, 2, 3
      const buildingData: any = {
        b1: { x: 300, y: 300, w: 220, h: 500 },
        b2: { x: 900, y: 300, w: 260, h: 500 },
        b3: { x: 1450, y: 300, w: 240, h: 500 },
      };
      const building = buildingData[state.building];
      if (building) {
        const padding = 14, gaps = 10;
        const roomHeight = Math.max(28, Math.floor((building.h - padding*2 - gaps*(roomsCount-1))/roomsCount));
        const startY = building.y + (building.h - (roomHeight*roomsCount + gaps*(roomsCount-1)))/2;
        
        for (let i = 0; i < roomsCount; i++) {
          const rx = building.x + padding;
          const ry = Math.round(startY + i*(roomHeight + gaps));
          const rw = Math.max(36, building.w - padding*2);
          const code = roomCode(state.building, state.floor, i + 1);
          const isHighlighted = highlightedRooms.has(code);
          
          rooms.push(
            <g key={`room-${i}`} className={isHighlighted ? 'animate-pulse-glow' : ''}>
              <rect
                x={rx} y={ry} width={rw} height={roomHeight}
                fill={isHighlighted ? "#fef3c7" : "url(#roomGradient)"}
                stroke={isHighlighted ? "#22c55e" : "#6c757d"}
                strokeWidth={isHighlighted ? 6 : 3}
                rx="4"
                filter={isHighlighted ? "url(#searchGlow)" : "url(#shadow)"}
                className="cursor-pointer hover:opacity-80 transition-all"
                onClick={(ev) => handleRoomClick(state.building, state.floor, i + 1, ev)}
              />
              <text x={rx + rw/2} y={ry + roomHeight/2} className="text-[16px] font-bold" fill="#000000" textAnchor="middle" dominantBaseline="middle">
                Room {roomNumberFor(state.floor, i + 1)}
              </text>
            </g>
          );
        }
      }
    }
    return rooms;
  };

  // Mini-map component
  const renderMiniMap = () => {
    const miniScale = 0.08;
    const viewportW = (1 / state.zoom) * 100;
    const viewportH = (1 / state.zoom) * 100;
    const viewportX = 50 - (state.tx / SVG_WIDTH / state.zoom) * 100 - viewportW / 2;
    const viewportY = 50 - (state.ty / SVG_HEIGHT / state.zoom) * 100 - viewportH / 2;

    return (
      <div className="absolute bottom-16 right-2 lg:right-4 z-10 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg border border-border overflow-hidden">
        <div className="p-1 border-b border-border bg-muted/50">
          <span className="text-[9px] font-bold text-muted-foreground">Overview</span>
        </div>
        <svg width={SVG_WIDTH * miniScale} height={SVG_HEIGHT * miniScale} viewBox="0 0 2000 1200" className="block">
          <rect width="2000" height="1200" fill="#f0f4f8" />
          {/* Buildings */}
          <rect x="350" y="80" width="1300" height="120" fill={state.building === 'b4' ? '#eab308' : '#e9ecef'} stroke="#495057" strokeWidth="8" rx="8" />
          <rect x="300" y="300" width="220" height="500" fill={state.building === 'b1' ? '#eab308' : '#e9ecef'} stroke="#495057" strokeWidth="8" rx="8" />
          <rect x="900" y="300" width="260" height="500" fill={state.building === 'b2' ? '#eab308' : '#e9ecef'} stroke="#495057" strokeWidth="8" rx="8" />
          <rect x="1450" y="300" width="240" height="500" fill={state.building === 'b3' ? '#eab308' : '#e9ecef'} stroke="#495057" strokeWidth="8" rx="8" />
          <rect x="700" y="850" width="600" height="220" fill="#fff3cd" stroke="#b8860b" strokeWidth="8" rx="10" />
          <rect x="820" y="1100" width="360" height="160" fill="#ffe5e5" stroke="#bd2130" strokeWidth="8" rx="8" />
          <rect x="150" y="950" width="250" height="140" fill="#d4edda" stroke="#28a745" strokeWidth="8" rx="8" />
          {/* Viewport indicator */}
          <rect 
            x={viewportX * 20} 
            y={viewportY * 12} 
            width={Math.max(viewportW * 20, 40)} 
            height={Math.max(viewportH * 12, 30)} 
            fill="hsl(220 70% 25% / 0.2)" 
            stroke="hsl(220 70% 25%)" 
            strokeWidth="4" 
            rx="4"
            className="animate-pulse"
          />
        </svg>
      </div>
    );
  };

  return (
    <section id="kiosk" className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12 space-y-4 animate-fade-in">
          <div className="inline-block px-6 py-2 bg-accent/10 rounded-full mb-4">
            <span className="text-accent font-semibold">Digital Campus Navigation</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-primary">
            Interactive Campus Map
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Navigate through FABINHS with our comprehensive digital map featuring all buildings, floors, and room locations
          </p>
        </div>

        <div className="max-w-[2000px] mx-auto bg-card rounded-2xl shadow-strong overflow-hidden border border-border/50">
          <div className="grid lg:grid-cols-[320px_1fr] gap-0">
            {/* Left Panel - Controls */}
            <div className="bg-gradient-to-b from-primary/5 via-muted/30 to-transparent border-r border-border p-4 lg:p-6 space-y-4 lg:space-y-6 backdrop-blur-sm max-h-[300px] lg:max-h-none overflow-y-auto lg:overflow-visible">
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
                  <img src={fabinhsLogo} alt="FABINHS" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="font-bold text-lg text-foreground">Navigation Center</div>
                  <div className="text-xs text-muted-foreground">Campus Directory</div>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-sm font-semibold text-foreground mb-3 block flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    Select Building
                  </label>
                  <Select value={state.building} onValueChange={(value) => setState(prev => ({ ...prev, building: value, floor: 1 }))}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {buildings.map(b => (
                        <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground mb-3 block flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent"></span>
                    Floor Level
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map(f => (
                      <Button
                        key={f}
                        variant={state.floor === f ? "default" : "outline"}
                        onClick={() => setState(prev => ({ ...prev, floor: f }))}
                        className="font-bold h-11"
                      >
                        {f}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground mb-3 block flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-muted-foreground" />
                    Search Rooms
                  </label>
                  <div className="relative">
                    <Input
                      type="search"
                      placeholder="Find room or teacher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="h-11 pr-16"
                    />
                    {searchQuery && (
                      <button
                        onClick={clearSearch}
                        className="absolute right-10 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    )}
                    <button
                      onClick={handleSearch}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Search Results Dropdown */}
                  {searchQuery && searchResults.length > 0 && (
                    <div className="mt-2 bg-background border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {searchResults.map((result, idx) => (
                        <div
                          key={idx}
                          className="p-2 hover:bg-accent/10 cursor-pointer border-b border-border/50 last:border-b-0"
                          onClick={() => {
                            setHighlightedRooms(new Set([result.code]));
                            setState(prev => ({ ...prev, building: result.building, floor: result.floor }));
                            zoomToBuilding(result.building);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm">{result.code}</span>
                            <span className="text-xs text-muted-foreground">Floor {result.floor}</span>
                          </div>
                          {result.teacher && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {result.teacher} - {result.subject}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {highlightedRooms.size > 0 && (
                    <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-green-700 dark:text-green-400 font-medium">
                          {highlightedRooms.size} room(s) highlighted
                        </span>
                        <button onClick={clearSearch} className="text-xs text-green-600 dark:text-green-400 hover:underline">
                          Clear
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Room List */}
              <div className="border-t border-dashed border-border pt-4">
                <div className="flex justify-between items-center mb-3">
                  <strong className="text-sm">Rooms</strong>
                  <span className="text-xs text-muted-foreground">5</span>
                </div>
                <div className="space-y-2 max-h-[180px] overflow-y-auto">
                  {Array.from({ length: 5 }, (_, i) => {
                    const code = roomCode(state.building, state.floor, i + 1);
                    return (
                      <div
                        key={i}
                        className="flex justify-between items-center p-2 rounded-lg border border-border/50 cursor-pointer hover:bg-accent/10 transition-colors"
                        onClick={(ev) => handleRoomClick(state.building, state.floor, i + 1, ev as any)}
                      >
                        <span className="text-sm font-medium">{code}</span>
                        <span className="text-xs text-muted-foreground">{state.building.toUpperCase()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Map Legend - Moved here */}
              <div className="border-t border-dashed border-border pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <strong className="text-sm">Map Legend</strong>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                    <div className="w-4 h-4 rounded bg-gradient-to-b from-blue-200 to-blue-400 border-2 border-blue-500"></div>
                    <span className="text-xs font-medium">Buildings</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                    <div className="w-4 h-4 rounded bg-gradient-to-b from-blue-100 to-blue-200 border-2 border-blue-400"></div>
                    <span className="text-xs font-medium">Rooms</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                    <div className="w-4 h-4 rounded bg-gradient-to-b from-orange-200 to-orange-400 border-2 border-orange-500"></div>
                    <span className="text-xs font-medium">Gym</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                    <div className="w-4 h-4 rounded bg-gradient-to-b from-pink-200 to-pink-400 border-2 border-pink-500"></div>
                    <span className="text-xs font-medium">Canteen</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                    <div className="w-4 h-4 rounded bg-gradient-to-b from-green-200 to-green-400 border-2 border-green-500"></div>
                    <span className="text-xs font-medium">Entrance</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                    <div className="w-4 h-3 rounded bg-gradient-to-r from-amber-100 to-amber-200 border border-amber-400"></div>
                    <span className="text-xs font-medium">Pathways</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Map */}
            <div className="relative h-[calc(100vh-200px)] min-h-[700px] lg:h-[900px] bg-[#1a2744]">
              {/* Header - Modernized */}
              <div className="absolute top-0 left-0 right-0 z-10 bg-white/80 backdrop-blur-md p-3 lg:p-4 border-b border-slate-200/50 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                    <svg className="w-5 h-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground tracking-tight">
                      {buildings.find(b => b.value === state.building)?.label}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                      Floor {state.floor} • 5 rooms
                    </p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setZoom(state.zoom * 1.2)}
                    className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                    title="Zoom In"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setZoom(state.zoom / 1.2)}
                    className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                    title="Zoom Out"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setState(prev => ({ ...prev, zoom: 1, tx: 0, ty: 0 }))}
                    className="px-4 py-2.5 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all text-sm font-medium"
                    title="Reset View"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div
                ref={mapWrapRef}
                className="w-full h-full relative overflow-hidden pt-14 lg:pt-20"
                style={{ 
                  cursor: isPanning ? 'grabbing' : 'grab',
                  touchAction: 'none',
                  userSelect: 'none',
                }}
                onWheel={handleWheel}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onPointerLeave={handlePointerUp}
              >
                <div
                  style={{
                    transform: `translate3d(${state.tx}px, ${state.ty}px, 0) scale(${state.zoom})`,
                    transformOrigin: 'top left',
                    transition: isPanning ? 'none' : 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    width: '100%',
                    height: '100%',
                    willChange: 'transform',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    perspective: 1000,
                    WebkitPerspective: 1000,
                  }}
                >
                  <svg
                    ref={svgRef}
                    viewBox="0 0 2000 1200"
                    className="w-full h-full select-none"
                    style={{ pointerEvents: isPanning ? 'none' : 'auto' }}
                  >
                    <defs>
                      {/* Dark background gradient */}
                      <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#1e3a5f", stopOpacity: 1 }} />
                        <stop offset="50%" style={{ stopColor: "#1a2744", stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: "#0f172a", stopOpacity: 1 }} />
                      </linearGradient>
                      
                      {/* Grass/ground areas */}
                      <linearGradient id="grassGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#2d5a3d", stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: "#1e4d2b", stopOpacity: 1 }} />
                      </linearGradient>
                      
                      {/* Road/pathway gradient - Gray asphalt */}
                      <linearGradient id="roadGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#64748b", stopOpacity: 1 }} />
                        <stop offset="50%" style={{ stopColor: "#475569", stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: "#334155", stopOpacity: 1 }} />
                      </linearGradient>
                      
                      {/* 3D Building gradients - Light blue/white theme */}
                      <linearGradient id="buildingTop" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#e0f2fe", stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: "#bae6fd", stopOpacity: 1 }} />
                      </linearGradient>
                      <linearGradient id="buildingFront" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#7dd3fc", stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: "#38bdf8", stopOpacity: 1 }} />
                      </linearGradient>
                      <linearGradient id="buildingSide" x1="100%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#0ea5e9", stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: "#0284c7", stopOpacity: 1 }} />
                      </linearGradient>
                      
                      {/* Active building - Yellow/Gold theme */}
                      <linearGradient id="buildingTopActive" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#fef9c3", stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: "#fef08a", stopOpacity: 1 }} />
                      </linearGradient>
                      <linearGradient id="buildingFrontActive" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#fde047", stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: "#facc15", stopOpacity: 1 }} />
                      </linearGradient>
                      <linearGradient id="buildingSideActive" x1="100%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#eab308", stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: "#ca8a04", stopOpacity: 1 }} />
                      </linearGradient>
                      
                      {/* Room gradient */}
                      <linearGradient id="roomGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#f0f9ff", stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: "#e0f2fe", stopOpacity: 1 }} />
                      </linearGradient>
                      
                      {/* Gym gradient - Orange/Coral */}
                      <linearGradient id="gymTop" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#fed7aa", stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: "#fdba74", stopOpacity: 1 }} />
                      </linearGradient>
                      <linearGradient id="gymFront" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#fb923c", stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: "#f97316", stopOpacity: 1 }} />
                      </linearGradient>
                      <linearGradient id="gymSide" x1="100%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#ea580c", stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: "#c2410c", stopOpacity: 1 }} />
                      </linearGradient>
                      
                      {/* Canteen gradient - Rose/Pink */}
                      <linearGradient id="canteenTop" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#fecdd3", stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: "#fda4af", stopOpacity: 1 }} />
                      </linearGradient>
                      <linearGradient id="canteenFront" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#fb7185", stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: "#f43f5e", stopOpacity: 1 }} />
                      </linearGradient>
                      <linearGradient id="canteenSide" x1="100%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#e11d48", stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: "#be123c", stopOpacity: 1 }} />
                      </linearGradient>
                      
                      {/* Entrance gradient - Green */}
                      <linearGradient id="entranceTop" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#bbf7d0", stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: "#86efac", stopOpacity: 1 }} />
                      </linearGradient>
                      <linearGradient id="entranceFront" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#4ade80", stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: "#22c55e", stopOpacity: 1 }} />
                      </linearGradient>
                      <linearGradient id="entranceSide" x1="100%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#16a34a", stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: "#15803d", stopOpacity: 1 }} />
                      </linearGradient>
                      
                      {/* Tree gradients */}
                      <radialGradient id="treeTop" cx="30%" cy="30%">
                        <stop offset="0%" style={{ stopColor: "#4ade80", stopOpacity: 1 }} />
                        <stop offset="70%" style={{ stopColor: "#22c55e", stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: "#16a34a", stopOpacity: 1 }} />
                      </radialGradient>
                      <linearGradient id="treeTrunk" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#a16207", stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: "#713f12", stopOpacity: 1 }} />
                      </linearGradient>
                      
                      {/* Enhanced shadows for 3D effect */}
                      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.3" />
                      </filter>
                      <filter id="buildingShadow" x="-30%" y="-30%" width="160%" height="160%">
                        <feDropShadow dx="10" dy="15" stdDeviation="12" floodColor="#000" floodOpacity="0.4" />
                      </filter>
                      <filter id="selectedGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="15" result="blur" />
                        <feFlood floodColor="#fbbf24" floodOpacity="0.8" result="color" />
                        <feComposite in="color" in2="blur" operator="in" result="glow" />
                        <feMerge>
                          <feMergeNode in="glow" />
                          <feMergeNode in="glow" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                      <filter id="searchGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="8" result="blur" />
                        <feFlood floodColor="#22c55e" floodOpacity="0.7" result="color" />
                        <feComposite in="color" in2="blur" operator="in" result="glow" />
                        <feMerge>
                          <feMergeNode in="glow" />
                          <feMergeNode in="glow" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    
                    {/* Dark navy background */}
                    <rect width="2000" height="1400" fill="url(#bgGradient)" />
                    
                    {/* Ground texture dots for depth */}
                    <g opacity="0.08">
                      {Array.from({ length: 80 }, (_, i) => (
                        <circle key={`dot-${i}`} cx={100 + (i % 20) * 95} cy={260 + Math.floor(i / 20) * 180} r={1.5 + Math.random()} fill="#94a3b8" />
                      ))}
                    </g>
                    
                    {/* Grass areas with subtle texture */}
                    <rect x="50" y="250" width="400" height="700" rx="20" fill="url(#grassGradient)" opacity="0.6" />
                    <rect x="550" y="250" width="500" height="700" rx="20" fill="url(#grassGradient)" opacity="0.6" />
                    <rect x="1150" y="250" width="400" height="700" rx="20" fill="url(#grassGradient)" opacity="0.6" />
                    <rect x="1650" y="250" width="300" height="700" rx="20" fill="url(#grassGradient)" opacity="0.6" />
                    
                    {/* Grass texture lines */}
                    <g opacity="0.12">
                      {[0, 1, 2, 3, 4, 5].map(i => (
                        <g key={`grass-line-${i}`}>
                          <line x1={100 + i * 60} y1={400 + i * 30} x2={110 + i * 60} y2={390 + i * 30} stroke="#4ade80" strokeWidth="1" />
                          <line x1={1200 + i * 50} y1={420 + i * 25} x2={1210 + i * 50} y2={410 + i * 25} stroke="#4ade80" strokeWidth="1" />
                        </g>
                      ))}
                    </g>

                    {/* Roads/Pathways - Gray asphalt like reference */}
                    <g id="roads">
                      {/* Main horizontal road */}
                      <rect x="100" y="210" width="1800" height="60" rx="4" fill="url(#roadGradient)" />
                      <line x1="100" y1="240" x2="1900" y2="240" stroke="#94a3b8" strokeWidth="2" strokeDasharray="20,15" />
                      
                      {/* Vertical roads connecting buildings */}
                      <rect x="390" y="270" width="50" height="720" rx="4" fill="url(#roadGradient)" />
                      <rect x="1000" y="270" width="50" height="620" rx="4" fill="url(#roadGradient)" />
                      <rect x="1550" y="270" width="50" height="720" rx="4" fill="url(#roadGradient)" />
                      
                      {/* Vertical road lane markings */}
                      <line x1="415" y1="270" x2="415" y2="890" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="15,12" />
                      <line x1="1025" y1="270" x2="1025" y2="890" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="15,12" />
                      <line x1="1575" y1="270" x2="1575" y2="890" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="15,12" />
                      
                      {/* Connecting road at bottom */}
                      <rect x="100" y="890" width="1500" height="50" rx="4" fill="url(#roadGradient)" />
                      <line x1="100" y1="915" x2="1600" y2="915" stroke="#94a3b8" strokeWidth="2" strokeDasharray="20,15" />
                      
                      {/* Road to entrance */}
                      <rect x="100" y="940" width="350" height="50" rx="4" fill="url(#roadGradient)" />
                      <line x1="100" y1="965" x2="450" y2="965" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="12,10" />
                      
                      {/* Road to gym and canteen */}
                      <rect x="650" y="890" width="50" height="220" rx="4" fill="url(#roadGradient)" />
                      <line x1="675" y1="890" x2="675" y2="1110" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="12,10" />
                      <rect x="1300" y="890" width="50" height="220" rx="4" fill="url(#roadGradient)" />
                      <line x1="1325" y1="890" x2="1325" y2="1110" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="12,10" />
                      
                      {/* Parking area with markings */}
                      <rect x="1690" y="280" width="200" height="120" rx="6" fill="#334155" opacity="0.5" />
                      <text x="1790" y="295" className="text-[10px]" fill="#94a3b8" textAnchor="middle" dominantBaseline="middle" opacity="0.7">PARKING</text>
                      <g opacity="0.6">
                        {[0, 1, 2, 3, 4].map(i => (
                          <rect key={`park-${i}`} x={1700 + i * 35} y="300" width="25" height="50" rx="2" fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="4,3" />
                        ))}
                      </g>
                    </g>

                    {/* Decorative trees - More realistic 3D style */}
                    <g id="trees">
                      {/* Tree cluster near Building 1 */}
                      {[
                        { x: 180, y: 380, s: 1 },
                        { x: 220, y: 450, s: 0.8 },
                        { x: 160, y: 520, s: 0.9 },
                        { x: 200, y: 600, s: 1.1 },
                        { x: 170, y: 700, s: 0.85 },
                      ].map((t, i) => (
                        <g key={`tree-l-${i}`} transform={`translate(${t.x}, ${t.y}) scale(${t.s})`}>
                          <ellipse cx="0" cy="30" rx="18" ry="6" fill="#000" opacity="0.2" />
                          <rect x="-4" y="0" width="8" height="30" fill="url(#treeTrunk)" />
                          <circle cx="0" cy="-15" r="25" fill="url(#treeTop)" />
                          <circle cx="-12" cy="-8" r="18" fill="#22c55e" />
                          <circle cx="10" cy="-5" r="16" fill="#4ade80" />
                        </g>
                      ))}
                      
                      {/* Tree cluster near Building 3 */}
                      {[
                        { x: 1820, y: 400, s: 1.1 },
                        { x: 1850, y: 480, s: 0.9 },
                        { x: 1800, y: 560, s: 1 },
                        { x: 1840, y: 650, s: 0.85 },
                        { x: 1810, y: 750, s: 0.95 },
                      ].map((t, i) => (
                        <g key={`tree-r-${i}`} transform={`translate(${t.x}, ${t.y}) scale(${t.s})`}>
                          <ellipse cx="0" cy="30" rx="18" ry="6" fill="#000" opacity="0.2" />
                          <rect x="-4" y="0" width="8" height="30" fill="url(#treeTrunk)" />
                          <circle cx="0" cy="-15" r="25" fill="url(#treeTop)" />
                          <circle cx="-12" cy="-8" r="18" fill="#22c55e" />
                          <circle cx="10" cy="-5" r="16" fill="#4ade80" />
                        </g>
                      ))}
                      
                      {/* Trees along pathways */}
                      {[
                        { x: 600, y: 280, s: 0.75 },
                        { x: 750, y: 280, s: 0.8 },
                        { x: 1250, y: 280, s: 0.75 },
                        { x: 1380, y: 280, s: 0.8 },
                        { x: 500, y: 980, s: 0.85 },
                        { x: 1450, y: 980, s: 0.85 },
                      ].map((t, i) => (
                        <g key={`tree-p-${i}`} transform={`translate(${t.x}, ${t.y}) scale(${t.s})`}>
                          <ellipse cx="0" cy="30" rx="18" ry="6" fill="#000" opacity="0.2" />
                          <rect x="-4" y="0" width="8" height="30" fill="url(#treeTrunk)" />
                          <circle cx="0" cy="-15" r="25" fill="url(#treeTop)" />
                          <circle cx="-12" cy="-8" r="18" fill="#22c55e" />
                          <circle cx="10" cy="-5" r="16" fill="#4ade80" />
                        </g>
                      ))}
                    </g>

                    {/* 3D Isometric Buildings */}
                    
                    {/* Building 4 - Top horizontal building */}
                    <g onClick={(e) => { e.stopPropagation(); zoomToBuilding('b4'); }} className="cursor-pointer" style={{ filter: state.building === 'b4' ? 'url(#selectedGlow)' : undefined }}>
                      {/* Shadow */}
                      <ellipse cx="1000" cy="200" rx="680" ry="30" fill="#000" opacity="0.25" />
                      {/* 3D Building - Top face */}
                      <path d="M350,60 L1650,60 L1700,100 L1700,180 L1650,200 L350,200 L300,180 L300,100 Z" 
                            fill={state.building === 'b4' ? 'url(#buildingTopActive)' : 'url(#buildingTop)'} 
                            stroke={state.building === 'b4' ? '#ca8a04' : '#0284c7'} strokeWidth="2" filter="url(#buildingShadow)" />
                      {/* Front face */}
                      <path d="M350,200 L1650,200 L1700,180 L1700,200 L350,200 Z" 
                            fill={state.building === 'b4' ? 'url(#buildingFrontActive)' : 'url(#buildingFront)'} />
                      {/* Right side face */}
                      <path d="M1650,60 L1700,100 L1700,180 L1650,200 L1650,60 Z" 
                            fill={state.building === 'b4' ? 'url(#buildingSideActive)' : 'url(#buildingSide)'} />
                      {/* Left side face */}
                      <path d="M300,100 L350,60 L350,200 L300,180 Z" 
                            fill={state.building === 'b4' ? 'url(#buildingSideActive)' : 'url(#buildingSide)'} />
                      {/* Windows */}
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                        <rect key={`b4-win-${i}`} x={400 + i * 125} y={100} width="80" height="50" rx="4" fill="#bae6fd" stroke="#0ea5e9" strokeWidth="1" />
                      ))}
                      {/* Roof details - AC units */}
                      {[0, 1, 2].map(i => (
                        <rect key={`b4-ac-${i}`} x={450 + i * 400} y={68} width="30" height="20" rx="3" fill="#94a3b8" stroke="#64748b" strokeWidth="1" opacity="0.7" />
                      ))}
                      {/* Label */}
                      <rect x="880" y="115" width="240" height="40" rx="8" fill="white" opacity="0.95" filter="url(#shadow)" />
                      <text x="1000" y="140" className="text-[22px] font-bold" fill="#0c4a6e" textAnchor="middle" dominantBaseline="middle">Building 4</text>
                    </g>

                    {/* Building 1 */}
                    <g onClick={(e) => { e.stopPropagation(); zoomToBuilding('b1'); }} className="cursor-pointer" style={{ filter: state.building === 'b1' ? 'url(#selectedGlow)' : undefined }}>
                      {/* Shadow */}
                      <ellipse cx="410" cy="840" rx="140" ry="25" fill="#000" opacity="0.3" />
                      {/* 3D Building - Main body */}
                      <path d="M300,300 L520,300 L560,340 L560,800 L520,820 L300,820 L260,800 L260,340 Z" 
                            fill={state.building === 'b1' ? 'url(#buildingTopActive)' : 'url(#buildingTop)'} 
                            stroke={state.building === 'b1' ? '#ca8a04' : '#0284c7'} strokeWidth="2" filter="url(#buildingShadow)" />
                      {/* Left side face */}
                      <path d="M260,340 L300,300 L300,820 L260,800 Z" 
                            fill={state.building === 'b1' ? 'url(#buildingSideActive)' : 'url(#buildingSide)'} />
                      {/* Right side face */}
                      <path d="M520,300 L560,340 L560,800 L520,820 Z" 
                            fill={state.building === 'b1' ? 'url(#buildingFrontActive)' : 'url(#buildingFront)'} />
                      {/* Windows */}
                      {[0, 1, 2, 3, 4].map(i => (
                        <rect key={`b1-win-${i}`} x={320} y={340 + i * 90} width="160" height="60" rx="4" fill="#bae6fd" stroke="#0ea5e9" strokeWidth="1" />
                      ))}
                      {/* Roof details */}
                      <rect x="390" y="305" width="20" height="15" rx="2" fill="#94a3b8" stroke="#64748b" strokeWidth="1" opacity="0.6" />
                      {/* Door */}
                      <rect x="390" y="780" width="40" height="35" rx="3" fill="#0369a1" stroke="#075985" strokeWidth="1.5" />
                      <circle cx="425" cy="800" r="3" fill="#fbbf24" />
                      {/* Label */}
                      <rect x="305" y="540" width="210" height="40" rx="8" fill="white" opacity="0.95" filter="url(#shadow)" />
                      <text x="410" y="565" className="text-[20px] font-bold" fill="#0c4a6e" textAnchor="middle" dominantBaseline="middle">Building 1</text>
                    </g>

                    {/* Building 2 */}
                    <g onClick={(e) => { e.stopPropagation(); zoomToBuilding('b2'); }} className="cursor-pointer" style={{ filter: state.building === 'b2' ? 'url(#selectedGlow)' : undefined }}>
                      {/* Shadow */}
                      <ellipse cx="1030" cy="840" rx="160" ry="25" fill="#000" opacity="0.3" />
                      {/* 3D Building */}
                      <path d="M900,300 L1160,300 L1200,340 L1200,800 L1160,820 L900,820 L860,800 L860,340 Z" 
                            fill={state.building === 'b2' ? 'url(#buildingTopActive)' : 'url(#buildingTop)'} 
                            stroke={state.building === 'b2' ? '#ca8a04' : '#0284c7'} strokeWidth="2" filter="url(#buildingShadow)" />
                      {/* Left side face */}
                      <path d="M860,340 L900,300 L900,820 L860,800 Z" 
                            fill={state.building === 'b2' ? 'url(#buildingSideActive)' : 'url(#buildingSide)'} />
                      {/* Right side face */}
                      <path d="M1160,300 L1200,340 L1200,800 L1160,820 Z" 
                            fill={state.building === 'b2' ? 'url(#buildingFrontActive)' : 'url(#buildingFront)'} />
                      {/* Windows */}
                      {[0, 1, 2, 3, 4].map(i => (
                        <rect key={`b2-win-${i}`} x={920} y={340 + i * 90} width="200" height="60" rx="4" fill="#bae6fd" stroke="#0ea5e9" strokeWidth="1" />
                      ))}
                      {/* Roof details */}
                      <rect x="1010" y="305" width="20" height="15" rx="2" fill="#94a3b8" stroke="#64748b" strokeWidth="1" opacity="0.6" />
                      <rect x="1040" y="308" width="15" height="12" rx="2" fill="#94a3b8" stroke="#64748b" strokeWidth="1" opacity="0.5" />
                      {/* Door */}
                      <rect x="1010" y="780" width="40" height="35" rx="3" fill="#0369a1" stroke="#075985" strokeWidth="1.5" />
                      <circle cx="1045" cy="800" r="3" fill="#fbbf24" />
                      {/* Label */}
                      <rect x="915" y="540" width="230" height="40" rx="8" fill="white" opacity="0.95" filter="url(#shadow)" />
                      <text x="1030" y="565" className="text-[20px] font-bold" fill="#0c4a6e" textAnchor="middle" dominantBaseline="middle">Building 2</text>
                    </g>

                    {/* Building 3 */}
                    <g onClick={(e) => { e.stopPropagation(); zoomToBuilding('b3'); }} className="cursor-pointer" style={{ filter: state.building === 'b3' ? 'url(#selectedGlow)' : undefined }}>
                      {/* Shadow */}
                      <ellipse cx="1570" cy="840" rx="150" ry="25" fill="#000" opacity="0.3" />
                      {/* 3D Building */}
                      <path d="M1450,300 L1690,300 L1730,340 L1730,800 L1690,820 L1450,820 L1410,800 L1410,340 Z" 
                            fill={state.building === 'b3' ? 'url(#buildingTopActive)' : 'url(#buildingTop)'} 
                            stroke={state.building === 'b3' ? '#ca8a04' : '#0284c7'} strokeWidth="2" filter="url(#buildingShadow)" />
                      {/* Left side face */}
                      <path d="M1410,340 L1450,300 L1450,820 L1410,800 Z" 
                            fill={state.building === 'b3' ? 'url(#buildingSideActive)' : 'url(#buildingSide)'} />
                      {/* Right side face */}
                      <path d="M1690,300 L1730,340 L1730,800 L1690,820 Z" 
                            fill={state.building === 'b3' ? 'url(#buildingFrontActive)' : 'url(#buildingFront)'} />
                      {/* Windows */}
                      {[0, 1, 2, 3, 4].map(i => (
                        <rect key={`b3-win-${i}`} x={1470} y={340 + i * 90} width="180" height="60" rx="4" fill="#bae6fd" stroke="#0ea5e9" strokeWidth="1" />
                      ))}
                      {/* Roof details */}
                      <rect x="1550" y="305" width="20" height="15" rx="2" fill="#94a3b8" stroke="#64748b" strokeWidth="1" opacity="0.6" />
                      {/* Door */}
                      <rect x="1550" y="780" width="40" height="35" rx="3" fill="#0369a1" stroke="#075985" strokeWidth="1.5" />
                      <circle cx="1585" cy="800" r="3" fill="#fbbf24" />
                      {/* Label */}
                      <rect x="1460" y="540" width="220" height="40" rx="8" fill="white" opacity="0.95" filter="url(#shadow)" />
                      <text x="1570" y="565" className="text-[20px] font-bold" fill="#0c4a6e" textAnchor="middle" dominantBaseline="middle">Building 3</text>
                    </g>

                    {/* Gymnasium */}
                    <g className="cursor-pointer">
                      {/* Shadow */}
                      <ellipse cx="1000" cy="1100" rx="340" ry="30" fill="#000" opacity="0.35" />
                      {/* 3D Building */}
                      <path d="M700,870 L1300,870 L1340,910 L1340,1060 L1300,1080 L700,1080 L660,1060 L660,910 Z" 
                            fill="url(#gymTop)" stroke="#c2410c" strokeWidth="2" filter="url(#buildingShadow)" />
                      {/* Left side face */}
                      <path d="M660,910 L700,870 L700,1080 L660,1060 Z" fill="url(#gymSide)" />
                      {/* Right side face */}
                      <path d="M1300,870 L1340,910 L1340,1060 L1300,1080 Z" fill="url(#gymFront)" />
                      {/* Roof detail - curved */}
                      <ellipse cx="1000" cy="870" rx="300" ry="30" fill="#fdba74" stroke="#ea580c" strokeWidth="2" />
                      {/* Roof top highlight */}
                      <ellipse cx="1000" cy="865" rx="250" ry="20" fill="#fed7aa" opacity="0.6" />
                      {/* Court lines */}
                      <rect x="800" y="910" width="400" height="120" rx="6" fill="none" stroke="#fdba74" strokeWidth="2" strokeDasharray="8,4" opacity="0.5" />
                      <circle cx="1000" cy="970" r="40" fill="none" stroke="#fdba74" strokeWidth="2" strokeDasharray="8,4" opacity="0.5" />
                      {/* Label */}
                      <rect x="870" y="955" width="260" height="50" rx="10" fill="white" opacity="0.95" filter="url(#shadow)" />
                      <text x="1000" y="985" className="text-[24px] font-bold" fill="#9a3412" textAnchor="middle" dominantBaseline="middle">Gymnasium</text>
                    </g>

                    {/* Canteen */}
                    <g className="cursor-pointer">
                      {/* Shadow */}
                      <ellipse cx="1000" cy="1290" rx="210" ry="22" fill="#000" opacity="0.35" />
                      {/* 3D Building */}
                      <path d="M820,1110 L1180,1110 L1210,1140 L1210,1250 L1180,1270 L820,1270 L790,1250 L790,1140 Z" 
                            fill="url(#canteenTop)" stroke="#be123c" strokeWidth="2" filter="url(#buildingShadow)" />
                      {/* Left side face */}
                      <path d="M790,1140 L820,1110 L820,1270 L790,1250 Z" fill="url(#canteenSide)" />
                      {/* Right side face */}
                      <path d="M1180,1110 L1210,1140 L1210,1250 L1180,1270 Z" fill="url(#canteenFront)" />
                      {/* Table and chairs hint */}
                      {[0, 1, 2].map(i => (
                        <g key={`table-${i}`}>
                          <rect x={880 + i * 110} y={1150} width="40" height="25" rx="4" fill="#fda4af" stroke="#e11d48" strokeWidth="1" opacity="0.4" />
                          <circle cx={875 + i * 110} cy={1162} r="6" fill="#fecdd3" opacity="0.5" />
                          <circle cx={925 + i * 110} cy={1162} r="6" fill="#fecdd3" opacity="0.5" />
                        </g>
                      ))}
                      {/* Label */}
                      <rect x="895" y="1170" width="210" height="44" rx="8" fill="white" opacity="0.95" filter="url(#shadow)" />
                      <text x="1000" y="1196" className="text-[22px] font-bold" fill="#9f1239" textAnchor="middle" dominantBaseline="middle">Canteen</text>
                    </g>

                    {/* Entrance */}
                    <g className="cursor-pointer">
                      {/* Shadow */}
                      <ellipse cx="275" cy="1115" rx="155" ry="20" fill="#000" opacity="0.35" />
                      {/* 3D Building */}
                      <path d="M150,960 L400,960 L430,990 L430,1080 L400,1100 L150,1100 L120,1080 L120,990 Z" 
                            fill="url(#entranceTop)" stroke="#15803d" strokeWidth="2" filter="url(#buildingShadow)" />
                      {/* Left side face */}
                      <path d="M120,990 L150,960 L150,1100 L120,1080 Z" fill="url(#entranceSide)" />
                      {/* Right side face */}
                      <path d="M400,960 L430,990 L430,1080 L400,1100 Z" fill="url(#entranceFront)" />
                      {/* Gate icon - arch */}
                      <path d="M250,1020 Q275,990 300,1020 L300,1060 L250,1060 Z" fill="#166534" opacity="0.4" />
                      <rect x="255" y="1030" width="40" height="30" fill="#15803d" opacity="0.3" />
                      {/* Gate pillars */}
                      <rect x="165" y="970" width="15" height="45" rx="2" fill="#166534" stroke="#14532d" strokeWidth="1" />
                      <rect x="370" y="970" width="15" height="45" rx="2" fill="#166534" stroke="#14532d" strokeWidth="1" />
                      {/* Gate arch */}
                      <path d="M172,975 Q275,955 377,975" fill="none" stroke="#15803d" strokeWidth="3" />
                      {/* Label */}
                      <rect x="180" y="1018" width="190" height="40" rx="8" fill="white" opacity="0.95" filter="url(#shadow)" />
                      <text x="275" y="1042" className="text-[18px] font-bold" fill="#14532d" textAnchor="middle" dominantBaseline="middle">Main Entrance</text>
                    </g>

                    {/* Parked vehicles for realism */}
                    <g opacity="0.75">
                      {/* Yellow school bus */}
                      <rect x="470" y="1015" width="60" height="28" rx="6" fill="#fbbf24" stroke="#ca8a04" strokeWidth="1.5" />
                      <rect x="476" y="1020" width="14" height="10" rx="2" fill="#7dd3fc" stroke="#38bdf8" strokeWidth="0.5" />
                      <rect x="494" y="1020" width="14" height="10" rx="2" fill="#7dd3fc" stroke="#38bdf8" strokeWidth="0.5" />
                      <rect x="512" y="1020" width="14" height="10" rx="2" fill="#7dd3fc" stroke="#38bdf8" strokeWidth="0.5" />
                      <circle cx="480" cy="1045" r="5" fill="#334155" stroke="#1e293b" strokeWidth="1" />
                      <circle cx="520" cy="1045" r="5" fill="#334155" stroke="#1e293b" strokeWidth="1" />
                      
                      {/* Car 1 - sedan */}
                      <rect x="550" y="1020" width="40" height="22" rx="6" fill="#ef4444" stroke="#dc2626" strokeWidth="1" />
                      <rect x="555" y="1024" width="12" height="8" rx="2" fill="#bae6fd" />
                      <rect x="572" y="1024" width="12" height="8" rx="2" fill="#bae6fd" />
                      <circle cx="556" cy="1044" r="4" fill="#334155" />
                      <circle cx="584" cy="1044" r="4" fill="#334155" />
                      
                      {/* Car 2 - SUV */}
                      <rect x="600" y="1018" width="45" height="24" rx="5" fill="#3b82f6" stroke="#2563eb" strokeWidth="1" />
                      <rect x="606" y="1022" width="14" height="9" rx="2" fill="#bae6fd" />
                      <rect x="624" y="1022" width="14" height="9" rx="2" fill="#bae6fd" />
                      <circle cx="608" cy="1044" r="4" fill="#334155" />
                      <circle cx="638" cy="1044" r="4" fill="#334155" />
                      
                      {/* Parking lot vehicles */}
                      {[0, 1, 2, 3].map(i => (
                        <g key={`pcar-${i}`}>
                          <rect x={1705 + i * 35} y="310" width="22" height="40" rx="4" fill={['#64748b', '#ef4444', '#f59e0b', '#3b82f6'][i]} stroke="#475569" strokeWidth="1" />
                          <circle cx={1716 + i * 35} cy="315" r="3" fill="#bae6fd" opacity="0.8" />
                        </g>
                      ))}
                    </g>

                    {/* Lampposts along roads */}
                    <g id="lampposts">
                      {[
                        { x: 350, y: 870 }, { x: 600, y: 870 }, { x: 850, y: 870 },
                        { x: 1100, y: 870 }, { x: 1350, y: 870 },
                      ].map((lamp, i) => (
                        <g key={`lamp-${i}`}>
                          <rect x={lamp.x - 2} y={lamp.y - 30} width="4" height="30" fill="#94a3b8" />
                          <ellipse cx={lamp.x} cy={lamp.y - 32} rx="8" ry="4" fill="#fde68a" />
                          <circle cx={lamp.x} cy={lamp.y - 32} r="5" fill="#fef3c7" opacity="0.6" />
                          {/* Light glow */}
                          <circle cx={lamp.x} cy={lamp.y - 30} r="18" fill="#fef9c3" opacity="0.15" />
                        </g>
                      ))}
                    </g>

                    {/* Flower beds near buildings */}
                    <g id="flower-beds">
                      {/* Flower bed near B1 */}
                      <rect x="270" y="825" width="180" height="15" rx="6" fill="#2d5a3d" stroke="#1e4d2b" strokeWidth="1" />
                      {[0, 1, 2, 3, 4, 5].map(i => (
                        <circle key={`fb1-${i}`} cx={285 + i * 28} cy="830" r="5" fill={['#f472b6', '#fb923c', '#a78bfa', '#f472b6', '#fbbf24', '#f472b6'][i]} opacity="0.9" />
                      ))}
                      
                      {/* Flower bed near B2 */}
                      <rect x="870" y="825" width="200" height="15" rx="6" fill="#2d5a3d" stroke="#1e4d2b" strokeWidth="1" />
                      {[0, 1, 2, 3, 4, 5].map(i => (
                        <circle key={`fb2-${i}`} cx={888 + i * 30} cy="830" r="5" fill={['#a78bfa', '#f472b6', '#fbbf24', '#fb923c', '#a78bfa', '#f472b6'][i]} opacity="0.9" />
                      ))}
                      
                      {/* Flower bed near B3 */}
                      <rect x="1420" y="825" width="190" height="15" rx="6" fill="#2d5a3d" stroke="#1e4d2b" strokeWidth="1" />
                      {[0, 1, 2, 3, 4, 5].map(i => (
                        <circle key={`fb3-${i}`} cx={1438 + i * 28} cy="830" r="5" fill={['#fbbf24', '#f472b6', '#fb923c', '#a78bfa', '#fbbf24', '#f472b6'][i]} opacity="0.9" />
                      ))}
                    </g>

                    {/* Benches near trees */}
                    <g id="benches">
                      {[
                        { x: 200, y: 660 },
                        { x: 1840, y: 620 },
                      ].map((bench, i) => (
                        <g key={`bench-${i}`}>
                          <rect x={bench.x - 12} y={bench.y} width="24" height="8" rx="2" fill="#a16207" stroke="#854d0e" strokeWidth="1" />
                          <rect x={bench.x - 10} y={bench.y + 8} width="4" height="6" fill="#854d0e" />
                          <rect x={bench.x + 6} y={bench.y + 8} width="4" height="6" fill="#854d0e" />
                        </g>
                      ))}
                    </g>

                    {/* Flagpole near entrance */}
                    <g id="flagpole">
                      <rect x="130" y="930" width="3" height="60" fill="#94a3b8" />
                      <circle cx="131" cy="930" r="3" fill="#fbbf24" />
                      <path d="M133,933 L155,940 L133,947 Z" fill="#dc2626" />
                    </g>

                    {/* Crosswalks */}
                    <g id="crosswalks" opacity="0.6">
                      {/* Crosswalk to B1 */}
                      {[0, 1, 2, 3].map(i => (
                        <rect key={`cw1-${i}`} x={380 + i * 15} y="845" width="8" height="40" rx="1" fill="white" opacity="0.7" />
                      ))}
                      {/* Crosswalk to B2 */}
                      {[0, 1, 2, 3].map(i => (
                        <rect key={`cw2-${i}`} x={1000 + i * 15} y="845" width="8" height="40" rx="1" fill="white" opacity="0.7" />
                      ))}
                      {/* Crosswalk to B3 */}
                      {[0, 1, 2, 3].map(i => (
                        <rect key={`cw3-${i}`} x={1540 + i * 15} y="845" width="8" height="40" rx="1" fill="white" opacity="0.7" />
                      ))}
                    </g>

                    {/* Courtyard/Plaza between buildings */}
                    <g id="courtyard">
                      {/* Central plaza */}
                      <ellipse cx="700" cy="600" rx="60" ry="40" fill="#475569" opacity="0.3" />
                      <ellipse cx="700" cy="600" rx="40" ry="26" fill="#64748b" opacity="0.2" />
                      {/* Fountain */}
                      <circle cx="700" cy="600" r="18" fill="#0ea5e9" opacity="0.35" />
                      <circle cx="700" cy="600" r="10" fill="#38bdf8" opacity="0.5" />
                      <circle cx="700" cy="600" r="4" fill="#7dd3fc" opacity="0.7" />
                      
                      {/* Sitting area between B2 and B3 */}
                      <ellipse cx="1330" cy="580" rx="40" ry="30" fill="#475569" opacity="0.25" />
                      {[0, 1, 2].map(i => (
                        <rect key={`cseat-${i}`} x={1315 + i * 14} y="575" width="10" height="10" rx="2" fill="#78716c" opacity="0.5" />
                      ))}
                    </g>

                    {/* Rooms */}
                    {renderRooms()}
                  </svg>
                </div>
              </div>

              {/* Mini Map */}
              {renderMiniMap()}

              {/* Floor Pills - Modern */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-1.5 bg-white/90 backdrop-blur-md p-1.5 rounded-full shadow-lg border border-slate-200/50">
                {[1, 2, 3, 4].map(f => (
                  <button
                    key={f}
                    onClick={() => setState(prev => ({ ...prev, floor: f }))}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      state.floor === f 
                        ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-md' 
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Floor {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Room Info Dialog */}
      <Dialog open={showRoomDialog} onOpenChange={setShowRoomDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <MapPin className="w-6 h-6 text-primary" />
              {selectedRoom?.code}
            </DialogTitle>
            <DialogDescription>
              Room details and teacher schedule information
            </DialogDescription>
          </DialogHeader>
          
          {selectedRoom && teacherSchedules[selectedRoom.code] && (
            <div className="space-y-6 py-4">
              {/* Teacher Info */}
              <div className="bg-primary/5 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Teacher</p>
                    <p className="font-semibold text-lg">{teacherSchedules[selectedRoom.code].teacher}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Subject</p>
                    <p className="font-semibold">{teacherSchedules[selectedRoom.code].subject}</p>
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold text-lg">Class Schedule</h4>
                </div>
                <div className="space-y-2">
                  {teacherSchedules[selectedRoom.code].schedule.map((slot, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
                      <span className="font-medium">{slot.day}</span>
                      <span className="text-sm text-muted-foreground">{slot.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location Info */}
              <div className="border-t border-border pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Building</p>
                    <p className="font-semibold">{buildings.find(b => b.value === selectedRoom.bid)?.label}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Floor</p>
                    <p className="font-semibold">Floor {selectedRoom.floor}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedRoom && !teacherSchedules[selectedRoom.code] && (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No schedule information available for this room.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default KioskSystem;
