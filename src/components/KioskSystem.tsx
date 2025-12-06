import { useState, useRef, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Clock, User, BookOpen, MapPin, Search, X } from "lucide-react";
import fabinhsLogo from "@/assets/fabinhs-logo.jpg";

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
  const [showLegend, setShowLegend] = useState(true);
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

              <div className="border-t border-dashed border-border pt-4">
                <div className="flex justify-between items-center mb-3">
                  <strong className="text-sm">Rooms</strong>
                  <span className="text-xs text-muted-foreground">5</span>
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
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
            </div>

            {/* Right Panel - Map */}
            <div className="relative h-[calc(100vh-200px)] min-h-[700px] lg:h-[900px] bg-gradient-to-br from-muted/20 via-background to-accent/5">
              {/* Header */}
              <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 p-3 lg:p-6 border-b border-border flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 lg:gap-4">
                  <div className="w-8 h-8 lg:w-12 lg:h-12 rounded-xl bg-background flex items-center justify-center shadow-md">
                    <svg className="w-5 h-5 lg:w-7 lg:h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-base lg:text-xl text-foreground">
                      {buildings.find(b => b.value === state.building)?.label} - Floor {state.floor}
                    </h3>
                    <p className="text-xs lg:text-sm text-muted-foreground flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                      5 rooms available
                    </p>
                  </div>
                </div>
                <div className="flex gap-1.5 lg:gap-2">
                  <button
                    onClick={() => setShowLegend(!showLegend)}
                    className="p-1.5 lg:p-2.5 bg-background border border-border text-foreground rounded-lg hover:bg-accent hover:text-accent-foreground transition-all shadow-sm hover:shadow-md"
                    title="Toggle Legend"
                  >
                    <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setZoom(state.zoom * 1.2)}
                    className="p-1.5 lg:p-2.5 bg-background border border-border text-foreground rounded-lg hover:bg-primary hover:text-primary-foreground transition-all shadow-sm hover:shadow-md"
                    title="Zoom In"
                  >
                    <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setZoom(state.zoom / 1.2)}
                    className="p-1.5 lg:p-2.5 bg-background border border-border text-foreground rounded-lg hover:bg-primary hover:text-primary-foreground transition-all shadow-sm hover:shadow-md"
                    title="Zoom Out"
                  >
                    <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setState(prev => ({ ...prev, zoom: 1, tx: 0, ty: 0 }))}
                    className="p-1.5 lg:p-2.5 bg-accent/10 border border-accent/20 text-accent rounded-lg hover:bg-accent hover:text-accent-foreground transition-all shadow-sm hover:shadow-md font-medium px-2 lg:px-4 text-xs lg:text-sm"
                    title="Reset View"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Legend */}
              {showLegend && (
                <div className="absolute top-16 lg:top-24 left-2 lg:left-4 z-10 bg-background/95 backdrop-blur-sm rounded-xl shadow-lg border border-border p-2 lg:p-4 space-y-1.5 lg:space-y-2">
                  <div className="text-[10px] lg:text-xs font-bold text-foreground mb-2 lg:mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Map Legend
                  </div>
                  <div className="flex items-center gap-1.5 lg:gap-2 text-[10px] lg:text-xs">
                    <div className="w-3.5 h-3.5 lg:w-5 lg:h-5 bg-white border-2 border-[#6c757d] rounded"></div>
                    <span className="text-foreground font-medium">Classrooms</span>
                  </div>
                  <div className="flex items-center gap-1.5 lg:gap-2 text-[10px] lg:text-xs">
                    <div className="w-3.5 h-3.5 lg:w-5 lg:h-5 bg-[#e9ecef] border-2 border-[#495057] rounded"></div>
                    <span className="text-foreground font-medium">Buildings</span>
                  </div>
                  <div className="flex items-center gap-1.5 lg:gap-2 text-[10px] lg:text-xs">
                    <div className="w-3.5 h-3.5 lg:w-5 lg:h-5 bg-[#fff3cd] border-2 border-[#b8860b] rounded"></div>
                    <span className="text-foreground font-medium">Gymnasium</span>
                  </div>
                  <div className="flex items-center gap-1.5 lg:gap-2 text-[10px] lg:text-xs">
                    <div className="w-3.5 h-3.5 lg:w-5 lg:h-5 bg-[#ffe5e5] border-2 border-[#bd2130] rounded"></div>
                    <span className="text-foreground font-medium">Canteen</span>
                  </div>
                  <div className="flex items-center gap-1.5 lg:gap-2 text-[10px] lg:text-xs">
                    <div className="w-3.5 h-3.5 lg:w-5 lg:h-5 bg-[#d4edda] border-2 border-[#28a745] rounded"></div>
                    <span className="text-foreground font-medium">Entrance</span>
                  </div>
                </div>
              )}

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
                      <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                        <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e0e0e0" strokeWidth="1" opacity="0.3" />
                      </pattern>
                      <linearGradient id="buildingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#f8f9fa", stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: "#e9ecef", stopOpacity: 1 }} />
                      </linearGradient>
                      <linearGradient id="roomGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#ffffff", stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: "#f8f9fa", stopOpacity: 1 }} />
                      </linearGradient>
                      <linearGradient id="gymGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#fff3cd", stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: "#ffeaa7", stopOpacity: 1 }} />
                      </linearGradient>
                      <linearGradient id="canteenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#ffe5e5", stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: "#ffd1d1", stopOpacity: 1 }} />
                      </linearGradient>
                      <linearGradient id="entranceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#d4edda", stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: "#c3e6cb", stopOpacity: 1 }} />
                      </linearGradient>
                      <filter id="shadow">
                        <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.25" />
                      </filter>
                      <filter id="buildingShadow">
                        <feDropShadow dx="2" dy="6" stdDeviation="8" floodOpacity="0.35" />
                      </filter>
                      <filter id="selectedGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="8" result="blur" />
                        <feFlood floodColor="#eab308" floodOpacity="0.8" result="color" />
                        <feComposite in="color" in2="blur" operator="in" result="glow" />
                        <feMerge>
                          <feMergeNode in="glow" />
                          <feMergeNode in="glow" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                      <filter id="searchGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="6" result="blur" />
                        <feFlood floodColor="#22c55e" floodOpacity="0.9" result="color" />
                        <feComposite in="color" in2="blur" operator="in" result="glow" />
                        <feMerge>
                          <feMergeNode in="glow" />
                          <feMergeNode in="glow" />
                          <feMergeNode in="glow" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <rect width="2000" height="1200" fill="#f0f4f8" />
                    <rect width="2000" height="1200" fill="url(#grid)" />
                    {/* Buildings with realistic shadows and depth */}
                    <g onClick={(e) => { e.stopPropagation(); zoomToBuilding('b4'); }} className="cursor-pointer hover:opacity-90 transition-all" style={{ filter: state.building === 'b4' ? 'url(#selectedGlow)' : undefined }}>
                      <rect id="b4" x="350" y="80" width="1300" height="120" fill="url(#buildingGradient)" stroke={state.building === 'b4' ? '#eab308' : '#495057'} strokeWidth={state.building === 'b4' ? 8 : 5} rx="8" filter="url(#buildingShadow)" />
                      <rect x="360" y="90" width="20" height="100" fill="#dee2e6" opacity="0.6" />
                      <rect x="390" y="90" width="20" height="100" fill="#dee2e6" opacity="0.6" />
                      <text x="1000" y="150" className="text-[32px] font-bold" fill="#000000" textAnchor="middle" dominantBaseline="middle" style={{ textShadow: '2px 2px 4px rgba(255,255,255,0.8)' }}>BUILDING 4</text>
                    </g>

                    <g onClick={(e) => { e.stopPropagation(); zoomToBuilding('b1'); }} className="cursor-pointer hover:opacity-90 transition-all" style={{ filter: state.building === 'b1' ? 'url(#selectedGlow)' : undefined }}>
                      <rect id="b1" x="300" y="300" width="220" height="500" fill="url(#buildingGradient)" stroke={state.building === 'b1' ? '#eab308' : '#495057'} strokeWidth={state.building === 'b1' ? 8 : 5} rx="8" filter="url(#buildingShadow)" />
                      <rect x="310" y="320" width="30" height="40" fill="#dee2e6" opacity="0.7" />
                      <rect x="350" y="320" width="30" height="40" fill="#dee2e6" opacity="0.7" />
                      <rect x="390" y="320" width="30" height="40" fill="#dee2e6" opacity="0.7" />
                      <rect x="430" y="320" width="30" height="40" fill="#dee2e6" opacity="0.7" />
                      <rect x="470" y="320" width="30" height="40" fill="#dee2e6" opacity="0.7" />
                      <text x="410" y="560" className="text-[32px] font-bold" fill="#000000" textAnchor="middle" dominantBaseline="middle" style={{ textShadow: '2px 2px 4px rgba(255,255,255,0.8)' }}>BUILDING 1</text>
                    </g>

                    <g onClick={(e) => { e.stopPropagation(); zoomToBuilding('b2'); }} className="cursor-pointer hover:opacity-90 transition-all" style={{ filter: state.building === 'b2' ? 'url(#selectedGlow)' : undefined }}>
                      <rect id="b2" x="900" y="300" width="260" height="500" fill="url(#buildingGradient)" stroke={state.building === 'b2' ? '#eab308' : '#495057'} strokeWidth={state.building === 'b2' ? 8 : 5} rx="8" filter="url(#buildingShadow)" />
                      <rect x="910" y="320" width="35" height="40" fill="#dee2e6" opacity="0.7" />
                      <rect x="955" y="320" width="35" height="40" fill="#dee2e6" opacity="0.7" />
                      <rect x="1000" y="320" width="35" height="40" fill="#dee2e6" opacity="0.7" />
                      <rect x="1045" y="320" width="35" height="40" fill="#dee2e6" opacity="0.7" />
                      <rect x="1090" y="320" width="35" height="40" fill="#dee2e6" opacity="0.7" />
                      <text x="1030" y="560" className="text-[32px] font-bold" fill="#000000" textAnchor="middle" dominantBaseline="middle" style={{ textShadow: '2px 2px 4px rgba(255,255,255,0.8)' }}>BUILDING 2</text>
                    </g>

                    <g onClick={(e) => { e.stopPropagation(); zoomToBuilding('b3'); }} className="cursor-pointer hover:opacity-90 transition-all" style={{ filter: state.building === 'b3' ? 'url(#selectedGlow)' : undefined }}>
                      <rect id="b3" x="1450" y="300" width="240" height="500" fill="url(#buildingGradient)" stroke={state.building === 'b3' ? '#eab308' : '#495057'} strokeWidth={state.building === 'b3' ? 8 : 5} rx="8" filter="url(#buildingShadow)" />
                      <rect x="1460" y="320" width="30" height="40" fill="#dee2e6" opacity="0.7" />
                      <rect x="1500" y="320" width="30" height="40" fill="#dee2e6" opacity="0.7" />
                      <rect x="1540" y="320" width="30" height="40" fill="#dee2e6" opacity="0.7" />
                      <rect x="1580" y="320" width="30" height="40" fill="#dee2e6" opacity="0.7" />
                      <rect x="1620" y="320" width="30" height="40" fill="#dee2e6" opacity="0.7" />
                      <text x="1570" y="560" className="text-[32px] font-bold" fill="#000000" textAnchor="middle" dominantBaseline="middle" style={{ textShadow: '2px 2px 4px rgba(255,255,255,0.8)' }}>BUILDING 3</text>
                    </g>

                    <g onClick={(e) => { e.stopPropagation(); }} className="cursor-pointer hover:opacity-80 transition-opacity">
                      <rect id="gym" x="700" y="850" width="600" height="220" fill="url(#gymGradient)" stroke="#b8860b" strokeWidth="6" rx="10" filter="url(#buildingShadow)" />
                      <circle cx="850" cy="960" r="40" fill="none" stroke="#b8860b" strokeWidth="3" opacity="0.4" />
                      <circle cx="1150" cy="960" r="40" fill="none" stroke="#b8860b" strokeWidth="3" opacity="0.4" />
                      <text x="1000" y="970" className="text-[36px] font-bold" fill="#5a4003" textAnchor="middle" dominantBaseline="middle" style={{ textShadow: '2px 2px 4px rgba(255,255,255,0.6)' }}>GYMNASIUM</text>
                    </g>

                    <g onClick={(e) => { e.stopPropagation(); }} className="cursor-pointer hover:opacity-80 transition-opacity">
                      <rect id="canteen" x="820" y="1100" width="360" height="160" fill="url(#canteenGradient)" stroke="#bd2130" strokeWidth="5" rx="8" filter="url(#buildingShadow)" />
                      <rect x="860" y="1120" width="40" height="35" fill="#fff" opacity="0.6" />
                      <rect x="910" y="1120" width="40" height="35" fill="#fff" opacity="0.6" />
                      <rect x="960" y="1120" width="40" height="35" fill="#fff" opacity="0.6" />
                      <rect x="1010" y="1120" width="40" height="35" fill="#fff" opacity="0.6" />
                      <rect x="1060" y="1120" width="40" height="35" fill="#fff" opacity="0.6" />
                      <text x="1000" y="1190" className="text-[32px] font-bold" fill="#4a0a0f" textAnchor="middle" dominantBaseline="middle" style={{ textShadow: '2px 2px 4px rgba(255,255,255,0.6)' }}>CANTEEN</text>
                    </g>

                    <g onClick={(e) => { e.stopPropagation(); }} className="cursor-pointer hover:opacity-80 transition-opacity">
                      <rect id="entrance" x="150" y="950" width="250" height="140" fill="url(#entranceGradient)" stroke="#28a745" strokeWidth="5" rx="8" filter="url(#buildingShadow)" />
                      <path d="M 275 990 L 275 1050 M 260 1020 L 290 1020" stroke="#155724" strokeWidth="8" strokeLinecap="round" />
                      <text x="275" y="1020" className="text-[32px] font-bold" fill="#0a3d14" textAnchor="middle" dominantBaseline="middle" style={{ textShadow: '2px 2px 4px rgba(255,255,255,0.6)' }}>ENTRANCE</text>
                    </g>

                    {/* Rooms */}
                    {renderRooms()}
                  </svg>
                </div>
              </div>

              {/* Mini Map */}
              {renderMiniMap()}

              {/* Floor Pills */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                {[1, 2, 3, 4].map(f => (
                  <Button
                    key={f}
                    variant={state.floor === f ? "default" : "secondary"}
                    size="sm"
                    onClick={() => setState(prev => ({ ...prev, floor: f }))}
                    className="font-bold rounded-full"
                  >
                    FLOOR {f}
                  </Button>
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
