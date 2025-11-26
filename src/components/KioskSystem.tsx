import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import fabinhsLogo from "@/assets/fabinhs-logo.jpg";

interface State {
  building: string;
  floor: number;
  zoom: number;
  tx: number;
  ty: number;
}

const KioskSystem = () => {
  const [state, setState] = useState<State>({ building: 'b1', floor: 1, zoom: 1, tx: 0, ty: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0, show: false });
  const svgRef = useRef<SVGSVGElement>(null);
  const mapWrapRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [lastTranslate, setLastTranslate] = useState({ tx: 0, ty: 0 });

  const roomNumberFor = (floor: number, idx: number) => (floor * 100) + idx;
  const roomCode = (bid: string, floor: number, idx: number) => 
    `${bid.toUpperCase()}-${roomNumberFor(floor, idx)}`;

  const buildings = [
    { value: 'b1', label: 'Building 1' },
    { value: 'b2', label: 'Building 2' },
    { value: 'b3', label: 'Building 3' },
    { value: 'b4', label: 'Building 4' },
  ];

  const applyTransform = () => {
    if (svgRef.current) {
      svgRef.current.style.transform = `translate(${state.tx}px, ${state.ty}px) scale(${state.zoom})`;
    }
  };

  const setZoom = (newZoom: number) => {
    const minZ = 0.6, maxZ = 4;
    const z = Math.max(minZ, Math.min(maxZ, newZoom));
    setState(prev => ({ ...prev, zoom: z }));
  };

  const handleWheel = (ev: React.WheelEvent) => {
    ev.preventDefault();
    const delta = ev.deltaY < 0 ? 1.12 : 1/1.12;
    setZoom(state.zoom * delta);
  };

  const handlePointerDown = (ev: React.PointerEvent) => {
    if (ev.button && ev.button !== 0) return;
    setIsPanning(true);
    setPanStart({ x: ev.clientX, y: ev.clientY });
    setLastTranslate({ tx: state.tx, ty: state.ty });
  };

  const handlePointerMove = (ev: React.PointerEvent) => {
    if (!isPanning) return;
    const dx = ev.clientX - panStart.x;
    const dy = ev.clientY - panStart.y;
    setState(prev => ({ ...prev, tx: lastTranslate.tx + dx, ty: lastTranslate.ty + dy }));
  };

  const handlePointerUp = () => {
    setIsPanning(false);
  };

  const handleRoomClick = (bid: string, floor: number, idx: number, ev: React.MouseEvent) => {
    ev.stopPropagation();
    const code = roomCode(bid, floor, idx);
    setSelectedRoom({ bid, floor, idx, code });
    if (mapWrapRef.current) {
      const rect = mapWrapRef.current.getBoundingClientRect();
      setPopupPos({ 
        x: Math.min(Math.max(8, ev.clientX - rect.left), rect.width - 260), 
        y: Math.min(Math.max(8, ev.clientY - rect.top), rect.height - 120),
        show: true 
      });
    }
  };

  const closePopup = () => {
    setPopupPos(prev => ({ ...prev, show: false }));
    setSelectedRoom(null);
  };

  useEffect(() => {
    applyTransform();
  }, [state.tx, state.ty, state.zoom]);

  const renderRooms = () => {
    const rooms = [];
    const roomsCount = 5;

    if (state.building === 'b4') {
      // Horizontal rooms for Building 4
      const gap = 18, roomW = 230, ry = 100;
      const baseX = 400;
      for (let i = 0; i < roomsCount; i++) {
        const rx = baseX + i * (roomW + gap);
        rooms.push(
          <g key={`room-${i}`}>
            <rect
              x={rx} y={ry} width={roomW} height={40}
              fill="url(#roomGradient)"
              stroke="#6c757d"
              strokeWidth="3"
              rx="4"
              filter="url(#shadow)"
              className="cursor-pointer hover:opacity-80 transition-all"
              onClick={(ev) => handleRoomClick(state.building, state.floor, i + 1, ev)}
            />
            <text x={rx + roomW/2} y={ry + 20} className="text-[14px] font-bold" fill="#212529" textAnchor="middle" dominantBaseline="middle">
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
          
          rooms.push(
            <g key={`room-${i}`}>
              <rect
                x={rx} y={ry} width={rw} height={roomHeight}
                fill="url(#roomGradient)"
                stroke="#6c757d"
                strokeWidth="3"
                rx="4"
                filter="url(#shadow)"
                className="cursor-pointer hover:opacity-80 transition-all"
                onClick={(ev) => handleRoomClick(state.building, state.floor, i + 1, ev)}
              />
              <text x={rx + rw/2} y={ry + roomHeight/2} className="text-[14px] font-bold" fill="#212529" textAnchor="middle" dominantBaseline="middle">
                Room {roomNumberFor(state.floor, i + 1)}
              </text>
            </g>
          );
        }
      }
    }
    return rooms;
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
                    <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search Rooms
                  </label>
                  <Input
                    type="search"
                    placeholder="Find room or teacher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-11"
                  />
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

              <div
                ref={mapWrapRef}
                className="w-full h-full relative overflow-hidden cursor-grab active:cursor-grabbing pt-14 lg:pt-20"
                onWheel={handleWheel}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onClick={closePopup}
              >
                <svg
                  ref={svgRef}
                  viewBox="0 0 2000 1200"
                  className="w-full h-full select-none"
                  style={{ transformOrigin: '0 0', transition: isPanning ? 'none' : 'transform 0.18s cubic-bezier(.2,.9,.2,1)' }}
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
                  </defs>
                  <rect width="2000" height="1200" fill="#f0f4f8" />
                  <rect width="2000" height="1200" fill="url(#grid)" />
                  {/* Buildings with realistic shadows and depth */}
                  <rect id="b4" x="350" y="80" width="1300" height="120" fill="url(#buildingGradient)" stroke="#495057" strokeWidth="5" rx="8" filter="url(#buildingShadow)" />
                  <rect x="360" y="90" width="20" height="100" fill="#dee2e6" opacity="0.6" />
                  <rect x="390" y="90" width="20" height="100" fill="#dee2e6" opacity="0.6" />
                  <text x="1000" y="150" className="text-[28px] font-bold" fill="#212529" textAnchor="middle" dominantBaseline="middle">BUILDING 4</text>

                  <rect id="b1" x="300" y="300" width="220" height="500" fill="url(#buildingGradient)" stroke="#495057" strokeWidth="5" rx="8" filter="url(#buildingShadow)" />
                  <rect x="310" y="320" width="30" height="40" fill="#dee2e6" opacity="0.7" />
                  <rect x="350" y="320" width="30" height="40" fill="#dee2e6" opacity="0.7" />
                  <rect x="390" y="320" width="30" height="40" fill="#dee2e6" opacity="0.7" />
                  <rect x="430" y="320" width="30" height="40" fill="#dee2e6" opacity="0.7" />
                  <rect x="470" y="320" width="30" height="40" fill="#dee2e6" opacity="0.7" />
                  <text x="410" y="560" className="text-[28px] font-bold" fill="#212529" textAnchor="middle" dominantBaseline="middle">BUILDING 1</text>

                  <rect id="b2" x="900" y="300" width="260" height="500" fill="url(#buildingGradient)" stroke="#495057" strokeWidth="5" rx="8" filter="url(#buildingShadow)" />
                  <rect x="910" y="320" width="35" height="40" fill="#dee2e6" opacity="0.7" />
                  <rect x="955" y="320" width="35" height="40" fill="#dee2e6" opacity="0.7" />
                  <rect x="1000" y="320" width="35" height="40" fill="#dee2e6" opacity="0.7" />
                  <rect x="1045" y="320" width="35" height="40" fill="#dee2e6" opacity="0.7" />
                  <rect x="1090" y="320" width="35" height="40" fill="#dee2e6" opacity="0.7" />
                  <text x="1030" y="560" className="text-[28px] font-bold" fill="#212529" textAnchor="middle" dominantBaseline="middle">BUILDING 2</text>

                  <rect id="b3" x="1450" y="300" width="240" height="500" fill="url(#buildingGradient)" stroke="#495057" strokeWidth="5" rx="8" filter="url(#buildingShadow)" />
                  <rect x="1460" y="320" width="30" height="40" fill="#dee2e6" opacity="0.7" />
                  <rect x="1500" y="320" width="30" height="40" fill="#dee2e6" opacity="0.7" />
                  <rect x="1540" y="320" width="30" height="40" fill="#dee2e6" opacity="0.7" />
                  <rect x="1580" y="320" width="30" height="40" fill="#dee2e6" opacity="0.7" />
                  <rect x="1620" y="320" width="30" height="40" fill="#dee2e6" opacity="0.7" />
                  <text x="1570" y="560" className="text-[28px] font-bold" fill="#212529" textAnchor="middle" dominantBaseline="middle">BUILDING 3</text>

                  <rect id="gym" x="700" y="850" width="600" height="220" fill="url(#gymGradient)" stroke="#b8860b" strokeWidth="6" rx="10" filter="url(#buildingShadow)" />
                  <circle cx="850" cy="960" r="40" fill="none" stroke="#b8860b" strokeWidth="3" opacity="0.4" />
                  <circle cx="1150" cy="960" r="40" fill="none" stroke="#b8860b" strokeWidth="3" opacity="0.4" />
                  <text x="1000" y="970" className="text-[32px] font-bold" fill="#856404" textAnchor="middle" dominantBaseline="middle">GYMNASIUM</text>

                  <rect id="canteen" x="820" y="1100" width="360" height="160" fill="url(#canteenGradient)" stroke="#bd2130" strokeWidth="5" rx="8" filter="url(#buildingShadow)" />
                  <rect x="860" y="1120" width="40" height="35" fill="#fff" opacity="0.6" />
                  <rect x="910" y="1120" width="40" height="35" fill="#fff" opacity="0.6" />
                  <rect x="960" y="1120" width="40" height="35" fill="#fff" opacity="0.6" />
                  <rect x="1010" y="1120" width="40" height="35" fill="#fff" opacity="0.6" />
                  <rect x="1060" y="1120" width="40" height="35" fill="#fff" opacity="0.6" />
                  <text x="1000" y="1190" className="text-[28px] font-bold" fill="#721c24" textAnchor="middle" dominantBaseline="middle">CANTEEN</text>

                  <rect id="entrance" x="150" y="950" width="250" height="140" fill="url(#entranceGradient)" stroke="#28a745" strokeWidth="5" rx="8" filter="url(#buildingShadow)" />
                  <path d="M 275 990 L 275 1050 M 260 1020 L 290 1020" stroke="#155724" strokeWidth="8" strokeLinecap="round" />
                  <text x="275" y="1020" className="text-[28px] font-bold" fill="#155724" textAnchor="middle" dominantBaseline="middle">ENTRANCE</text>

                  {/* Rooms */}
                  {renderRooms()}
                </svg>

                {/* Popup */}
                {popupPos.show && selectedRoom && (
                  <div
                    className="absolute z-20 bg-card rounded-lg shadow-strong p-4 min-w-[220px]"
                    style={{ left: `${popupPos.x}px`, top: `${popupPos.y}px` }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h4 className="font-bold text-lg mb-2">{selectedRoom.code}</h4>
                    <p className="text-sm text-muted-foreground mb-1">Teacher: TBA</p>
                    <p className="text-sm text-muted-foreground mb-3">Schedule: TBA</p>
                    <Button onClick={closePopup} className="w-full" size="sm">Close</Button>
                  </div>
                )}
              </div>

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
    </section>
  );
};

export default KioskSystem;
