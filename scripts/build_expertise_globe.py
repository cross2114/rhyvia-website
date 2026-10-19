from pathlib import Path
import math
assets=Path(__file__).resolve().parents[1]/"dist/assets"
# Decorative globe, with deliberately simplified continental silhouettes; no service locations inferred.
polygons=[ [(-17,35),(0,37),(12,33),(32,31),(43,12),(51,10),(43,-12),(35,-20),(28,-34),(18,-35),(11,-17),(8,4),(-9,5),(-17,15)], [(-10,36),(-10,44),(-1,51),(8,55),(10,70),(27,71),(35,60),(55,69),(95,76),(150,65),(177,60),(157,50),(141,45),(130,33),(120,23),(110,19),(107,6),(100,2),(94,21),(80,8),(70,24),(54,26),(42,12),(34,30),(26,40),(12,46),(8,37)], [(-166,65),(-140,71),(-120,72),(-100,80),(-63,65),(-53,50),(-66,44),(-80,25),(-98,17),(-115,30),(-130,50)], [(-80,10),(-61,10),(-35,-6),(-44,-23),(-57,-39),(-68,-55),(-76,-32),(-82,-5)], [(112,-22),(116,-13),(132,-11),(142,-10),(153,-28),(145,-39),(127,-34),(113,-34)], [(-53,60),(-42,60),(-20,75),(-42,83),(-58,78)], [(46,-13),(51,-17),(48,-26),(44,-24)], [(130,32),(141,45),(145,44),(140,34)] ]
def inside(x,y,poly):
 c=False;j=len(poly)-1
 for i,(xi,yi) in enumerate(poly):
  xj,yj=poly[j]
  if ((yi>y)!=(yj>y)) and x<(xj-xi)*(y-yi)/(yj-yi)+xi:c=not c
  j=i
 return c
def project(lon,lat):
 lo=math.radians(lon-48);la=math.radians(lat);tilt=math.radians(18)
 x=math.cos(la)*math.sin(lo);y=math.cos(tilt)*math.sin(la)-math.sin(tilt)*math.cos(la)*math.cos(lo);z=math.sin(tilt)*math.sin(la)+math.cos(tilt)*math.cos(la)*math.cos(lo)
 return 360+270*x,360-270*y,z
svg=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720"><defs><radialGradient id="surface" cx="34%" cy="28%" r="75%"><stop stop-color="#fffcf5"/><stop offset=".65" stop-color="#ece6da"/><stop offset="1" stop-color="#d5cfbf"/></radialGradient><radialGradient id="halo"><stop stop-color="#c9b58c" stop-opacity=".22"/><stop offset="1" stop-color="#c9b58c" stop-opacity="0"/></radialGradient></defs><circle cx="360" cy="360" r="355" fill="url(#halo)"/><circle cx="360" cy="360" r="270" fill="url(#surface)" stroke="#bca985" stroke-opacity=".4"/>']
for lat in range(-60,90,30):
 pts=[]
 for lon in range(-180,181,2):
  x,y,z=project(lon,lat)
  if z>=0:pts.append((x,y))
  elif pts:
   svg.append('<polyline points="'+' '.join(f'{x:.1f},{y:.1f}' for x,y in pts)+'" fill="none" stroke="#9e8c68" stroke-opacity=".16" stroke-width=".7"/>');pts=[]
 if pts:svg.append('<polyline points="'+' '.join(f'{x:.1f},{y:.1f}' for x,y in pts)+'" fill="none" stroke="#9e8c68" stroke-opacity=".16" stroke-width=".7"/>')
for lon in range(-180,180,30):
 pts=[project(lon,lat) for lat in range(-90,91,2)];pts=[(x,y) for x,y,z in pts if z>=0]
 svg.append('<polyline points="'+' '.join(f'{x:.1f},{y:.1f}' for x,y in pts)+'" fill="none" stroke="#9e8c68" stroke-opacity=".16" stroke-width=".7"/>')
for lat in range(-58,81,3):
 for lon in range(-180,180,3):
  x,y,z=project(lon,lat)
  if z>.02 and any(inside(lon,lat,p) for p in polygons):svg.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{1.25+z*.6:.2f}" fill="#9c8863" opacity="{.35+z*.4:.2f}"/>')
# The far orbital arc is occluded by the opaque globe; the near arc stays above it.
rear='<g transform="rotate(-28 360 360)"><path d="M23 360 A337 108 0 0 1 697 360" fill="none" stroke="#af9363" stroke-width="1" stroke-opacity=".6"/></g>'
svg[0]=svg[0].replace('<circle cx="360" cy="360" r="270"',rear+'<circle cx="360" cy="360" r="270"')
px=360+337*math.cos(1.1);py=360+108*math.sin(1.1)
svg.append(f'<g transform="rotate(-28 360 360)"><path d="M697 360 A337 108 0 0 1 23 360" fill="none" stroke="#af9363" stroke-width="1" stroke-opacity=".6"/><circle cx="{px:.2f}" cy="{py:.2f}" r="5" fill="#a58b5f"/><circle cx="{px:.2f}" cy="{py:.2f}" r="13" fill="none" stroke="#a58b5f" stroke-opacity=".25"/></g></svg>')
(assets/'expertise-globe.svg').write_text(''.join(svg))
print('Saved decorative expertise globe with orbital occlusion.')
