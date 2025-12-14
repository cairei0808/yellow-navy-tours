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
                    <div className="w-4 h-4 rounded bg-gradient-to-b from-white to-gray-100 border-2 border-gray-400"></div>
                    <span className="text-xs font-medium">Rooms</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                    <div className="w-4 h-4 rounded bg-gradient-to-b from-gray-50 to-gray-200 border-2 border-gray-500"></div>
                    <span className="text-xs font-medium">Buildings</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                    <div className="w-4 h-4 rounded bg-gradient-to-b from-amber-100 to-amber-200 border-2 border-amber-600"></div>
                    <span className="text-xs font-medium">Gym</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                    <div className="w-4 h-4 rounded bg-gradient-to-b from-pink-100 to-pink-200 border-2 border-pink-500"></div>
                    <span className="text-xs font-medium">Canteen</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                    <div className="w-4 h-4 rounded bg-gradient-to-b from-green-100 to-green-200 border-2 border-green-500"></div>
                    <span className="text-xs font-medium">Entrance</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                    <div className="w-4 h-3 rounded bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 border border-dashed border-slate-400"></div>
                    <span className="text-xs font-medium">Pathways</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Map */}
            <div className="relative h-[calc(100vh-200px)] min-h-[700px] lg:h-[900px] bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
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
                      {/* Modern dot pattern instead of grid */}
                      <pattern id="dotPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                        <circle cx="20" cy="20" r="1.5" fill="#cbd5e1" opacity="0.5" />
                      </pattern>
                      {/* Modern building gradient */}
                      <linearGradient id="buildingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#ffffff", stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: "#f1f5f9", stopOpacity: 1 }} />
                      </linearGradient>
                      <linearGradient id="buildingGradientActive" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#fef9c3", stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: "#fef08a", stopOpacity: 1 }} />
                      </linearGradient>
                      <linearGradient id="roomGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#ffffff", stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: "#f8fafc", stopOpacity: 1 }} />
                      </linearGradient>
                      <linearGradient id="gymGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#fef3c7", stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: "#fde68a", stopOpacity: 1 }} />
                      </linearGradient>
                      <linearGradient id="canteenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#fce7f3", stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: "#fbcfe8", stopOpacity: 1 }} />
                      </linearGradient>
                      <linearGradient id="entranceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#dcfce7", stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: "#bbf7d0", stopOpacity: 1 }} />
                      </linearGradient>
                      {/* Modern soft shadows */}
                      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#0f172a" floodOpacity="0.08" />
                      </filter>
                      <filter id="buildingShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#0f172a" floodOpacity="0.12" />
                      </filter>
                      <filter id="selectedGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="12" result="blur" />
                        <feFlood floodColor="#eab308" floodOpacity="0.6" result="color" />
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
                      {/* Pathway gradient */}
                      <linearGradient id="pathwayGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{ stopColor: "#e2e8f0", stopOpacity: 1 }} />
                        <stop offset="50%" style={{ stopColor: "#f1f5f9", stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: "#e2e8f0", stopOpacity: 1 }} />
                      </linearGradient>
                    </defs>
                    {/* Clean modern background */}
                    <rect width="2000" height="1200" fill="#f8fafc" />
                    <rect width="2000" height="1200" fill="url(#dotPattern)" />

                    {/* Pathways */}
                    <g id="pathways">
                      {/* Main horizontal pathway connecting all buildings */}
                      <rect x="200" y="220" width="1550" height="60" rx="8" fill="url(#pathwayGradient)" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="8 4" />
                      
                      {/* Vertical pathway from Building 1 to Entrance */}
                      <rect x="380" y="800" width="50" height="150" rx="8" fill="url(#pathwayGradient)" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="8 4" />
                      <rect x="200" y="900" width="230" height="50" rx="8" fill="url(#pathwayGradient)" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="8 4" />
                      
                      {/* Pathway from buildings to gymnasium */}
                      <rect x="970" y="800" width="60" height="50" rx="8" fill="url(#pathwayGradient)" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="8 4" />
                      
                      {/* Pathway from gymnasium to canteen */}
                      <rect x="970" y="1070" width="60" height="30" rx="8" fill="url(#pathwayGradient)" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="8 4" />
                      
                      {/* Pathway connecting Building 3 area */}
                      <rect x="1540" y="800" width="50" height="100" rx="8" fill="url(#pathwayGradient)" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="8 4" />
                      <rect x="1300" y="880" width="290" height="40" rx="8" fill="url(#pathwayGradient)" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="8 4" />
                      
                      {/* Pathway labels */}
                      <text x="975" y="255" className="text-[14px] font-medium" fill="#94a3b8" textAnchor="middle">Main Walkway</text>
                    </g>

                    {/* Modern Buildings */}
                    <g onClick={(e) => { e.stopPropagation(); zoomToBuilding('b4'); }} className="cursor-pointer" style={{ filter: state.building === 'b4' ? 'url(#selectedGlow)' : undefined }}>
                      <rect id="b4" x="350" y="80" width="1300" height="120" fill={state.building === 'b4' ? 'url(#buildingGradientActive)' : 'url(#buildingGradient)'} stroke={state.building === 'b4' ? '#ca8a04' : '#94a3b8'} strokeWidth={state.building === 'b4' ? 4 : 2} rx="12" filter="url(#buildingShadow)" />
                      <text x="1000" y="145" className="text-[28px] font-semibold" fill="#334155" textAnchor="middle" dominantBaseline="middle">Building 4</text>
                    </g>

                    <g onClick={(e) => { e.stopPropagation(); zoomToBuilding('b1'); }} className="cursor-pointer" style={{ filter: state.building === 'b1' ? 'url(#selectedGlow)' : undefined }}>
                      <rect id="b1" x="300" y="300" width="220" height="500" fill={state.building === 'b1' ? 'url(#buildingGradientActive)' : 'url(#buildingGradient)'} stroke={state.building === 'b1' ? '#ca8a04' : '#94a3b8'} strokeWidth={state.building === 'b1' ? 4 : 2} rx="12" filter="url(#buildingShadow)" />
                      <text x="410" y="550" className="text-[28px] font-semibold" fill="#334155" textAnchor="middle" dominantBaseline="middle">Building 1</text>
                    </g>

                    <g onClick={(e) => { e.stopPropagation(); zoomToBuilding('b2'); }} className="cursor-pointer" style={{ filter: state.building === 'b2' ? 'url(#selectedGlow)' : undefined }}>
                      <rect id="b2" x="900" y="300" width="260" height="500" fill={state.building === 'b2' ? 'url(#buildingGradientActive)' : 'url(#buildingGradient)'} stroke={state.building === 'b2' ? '#ca8a04' : '#94a3b8'} strokeWidth={state.building === 'b2' ? 4 : 2} rx="12" filter="url(#buildingShadow)" />
                      <text x="1030" y="550" className="text-[28px] font-semibold" fill="#334155" textAnchor="middle" dominantBaseline="middle">Building 2</text>
                    </g>

                    <g onClick={(e) => { e.stopPropagation(); zoomToBuilding('b3'); }} className="cursor-pointer" style={{ filter: state.building === 'b3' ? 'url(#selectedGlow)' : undefined }}>
                      <rect id="b3" x="1450" y="300" width="240" height="500" fill={state.building === 'b3' ? 'url(#buildingGradientActive)' : 'url(#buildingGradient)'} stroke={state.building === 'b3' ? '#ca8a04' : '#94a3b8'} strokeWidth={state.building === 'b3' ? 4 : 2} rx="12" filter="url(#buildingShadow)" />
                      <text x="1570" y="550" className="text-[28px] font-semibold" fill="#334155" textAnchor="middle" dominantBaseline="middle">Building 3</text>
                    </g>

                    <g className="cursor-pointer">
                      <rect id="gym" x="700" y="850" width="600" height="220" fill="url(#gymGradient)" stroke="#d97706" strokeWidth="2" rx="16" filter="url(#buildingShadow)" />
                      <text x="1000" y="965" className="text-[32px] font-semibold" fill="#92400e" textAnchor="middle" dominantBaseline="middle">Gymnasium</text>
                    </g>

                    <g className="cursor-pointer">
                      <rect id="canteen" x="820" y="1100" width="360" height="160" fill="url(#canteenGradient)" stroke="#db2777" strokeWidth="2" rx="12" filter="url(#buildingShadow)" />
                      <text x="1000" y="1185" className="text-[26px] font-semibold" fill="#9d174d" textAnchor="middle" dominantBaseline="middle">Canteen</text>
                    </g>

                    <g className="cursor-pointer">
                      <rect id="entrance" x="150" y="950" width="250" height="140" fill="url(#entranceGradient)" stroke="#16a34a" strokeWidth="2" rx="12" filter="url(#buildingShadow)" />
                      <text x="275" y="1020" className="text-[24px] font-semibold" fill="#166534" textAnchor="middle" dominantBaseline="middle">Entrance</text>
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
