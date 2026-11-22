"""Render static review artwork, not browser screenshots.
Copy is read from index.html. All interface typography uses the existing Geist font.
The compass and product screens come from the unchanged source assets.
Run: python3 design/verus-journey/render-review.py
"""
from pathlib import Path
from functools import lru_cache
import json
import re
import xml.etree.ElementTree as ET
from PIL import Image, ImageDraw, ImageFont
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent
HTML = BeautifulSoup((ROOT / 'index.html').read_text(), 'html.parser')
NAVY = '#071526'
CREAM = '#f7f5ef'
GOLD = '#f1d27a'
ROUTE = '#796321'
MUTED = '#a9b4c2'
INK = '#48525a'
RULE = '#d1d0ca'
S = 2

@lru_cache(maxsize=80)
def font(size, bold=False):
    face = ImageFont.truetype(str(ROOT / 'assets/geist.woff2'), round(size * S))
    face.set_variation_by_name(b'SemiBold' if bold else b'Regular')
    return face

def txt(node):
    return node.get_text(' ', strip=True)

def content(selector):
    return txt(HTML.select_one(selector))

def multiline(node):
    return node.get_text('\n', strip=True)

class Board:
    def __init__(self, width, mobile):
        self.w = width
        self.mobile = mobile
        self.margin = 20 if mobile else 72
        self.im = Image.new('RGB', (width * S, 12000 * S), NAVY)
        self.d = ImageDraw.Draw(self.im)
        self.layout = {}

    def rect(self, x, y, w, h, color):
        self.d.rectangle((round(x*S), round(y*S), round((x+w)*S), round((y+h)*S)), fill=color)

    def line(self, x, y, x2, y2, color=RULE, width=1):
        self.d.line((round(x*S), round(y*S), round(x2*S), round(y2*S)), fill=color, width=max(1, round(width*S)))

    def width(self, text, size, bold=False):
        return self.d.textlength(text, font=font(size, bold)) / S

    def text(self, text, x, y, size=14, color=NAVY, bold=False, spacing=0):
        face = font(size, bold)
        # The Latin webfont omits some symbols. Draw these as vector marks,
        # matching the browser's fallback marks without changing body typography.
        if any(ch in text for ch in ('↗', '↓', '→', '✧', '✓')):
            cursor = x
            for segment in re.split(r'([↗↓→✧✓])', text):
                if segment not in ('↗', '↓', '→', '✧', '✓'):
                    self.d.text((round(cursor*S), round(y*S)), segment, font=face, fill=color, anchor='lt')
                    cursor += self.width(segment, size, bold)
                    continue
                a = size * .72
                cy = y + size * .45
                if segment == '↗':
                    self.line(cursor, cy+a*.5, cursor+a, cy-a*.5, color)
                    self.line(cursor+a, cy-a*.5, cursor+a, cy+a*.1, color)
                    self.line(cursor+a, cy-a*.5, cursor+a*.4, cy-a*.5, color)
                elif segment == '↓':
                    self.line(cursor+a*.5, y, cursor+a*.5, y+a, color)
                    self.line(cursor+a*.15, y+a*.65, cursor+a*.5, y+a, color)
                    self.line(cursor+a*.85, y+a*.65, cursor+a*.5, y+a, color)
                elif segment == '→':
                    self.line(cursor, cy, cursor+a, cy, color)
                    self.line(cursor+a*.65, cy-a*.35, cursor+a, cy, color)
                    self.line(cursor+a*.65, cy+a*.35, cursor+a, cy, color)
                elif segment == '✓':
                    self.line(cursor, cy, cursor+a*.3, cy+a*.3, color)
                    self.line(cursor+a*.3, cy+a*.3, cursor+a, cy-a*.4, color)
                else:
                    points = [(cursor+a*.5,y),(cursor+a*.6,y+a*.4),(cursor+a,y+a*.5),(cursor+a*.6,y+a*.6),(cursor+a*.5,y+a),(cursor+a*.4,y+a*.6),(cursor,y+a*.5),(cursor+a*.4,y+a*.4),(cursor+a*.5,y)]
                    for (ax,ay),(bx,by) in zip(points,points[1:]):
                        self.line(ax,ay,bx,by,color,.8)
                cursor += a + 2
        elif spacing:
            for ch in text:
                self.d.text((round(x*S),round(y*S)),ch,font=face,fill=color,anchor='lt')
                x += self.width(ch,size,bold) + spacing
        else:
            self.d.text((round(x*S),round(y*S)),text,font=face,fill=color,anchor='lt')
        return y + size * 1.3

    def lines(self, text, width, size, bold=False):
        result = []
        for hardline in text.split('\n'):
            line = ''
            for word in hardline.split():
                proposal = (line + ' ' + word).strip()
                if self.width(proposal,size,bold) > width and line:
                    result.append(line)
                    line = word
                else:
                    line = proposal
            if line:
                result.append(line)
        return result

    def para(self, text, x, y, width, size=14, color=INK, leading=1.8, bold=False, measure=False):
        for line in self.lines(text,width,size,bold):
            if not measure:
                self.text(line,x,y,size,color,bold)
            y += size * leading
        return y

    def eyebrow(self, text, x, y, color=ROUTE, size=None):
        return self.text(text,x,y,size or (9 if self.mobile else 10),color,True,.65)

    def brand(self, x, y, small=False):
        size = 20 if small else 23 if self.mobile else 27
        self.text('VERUS',x,y,size,GOLD,True,size*.16)
        self.text('OPERATING PARTNERS',x,y+size+5,6 if small else 7 if self.mobile else 8,GOLD,False,1)

    def button(self, x, y, width=None):
        width = width or (self.w-40 if self.mobile else 390)
        self.rect(x,y,width,58,GOLD)
        label = content('.start-action .button').replace(' ↗','')
        self.text(label,x+15,y+20,12 if self.mobile else 13,NAVY,True)
        self.text('↗',x+width-31,y+18,19,NAVY)
        return y + 58

    def diamond(self, x, y, fill=CREAM):
        self.d.polygon([(x*S,(y-4)*S),((x+4)*S,y*S),(x*S,(y+4)*S),((x-4)*S,y*S)],fill=fill,outline=ROUTE,width=S)
    def compass(self,x,y,size):
        # Rasterize the exact checked-in CompassRose paths, rings, and ticks.
        svg=ET.parse(ROOT/'assets/compass.svg').getroot()
        k=size/1000
        def xy(a,b):return ((x+float(a)*k)*S,(y+float(b)*k)*S)
        for el in svg.iter():
            tag=el.tag.split('}')[-1]
            if tag not in ('path','line','circle'):continue
            attr=el.attrib;style=attr.get('style','');opacity=float(re.search(r'opacity:([0-9.]+)',style).group(1)) if 'opacity:' in style else 1
            color=attr.get('fill') if attr.get('fill') not in (None,'none') else attr.get('stroke','var(--gold)')
            color=GOLD if color=='var(--gold-light)' else '#d4af37'
            raw=tuple(int(color[i:i+2],16) for i in (1,3,5));back=tuple(int(NAVY[i:i+2],16) for i in (1,3,5));color=tuple(round(b+(a-b)*opacity*.95) for a,b in zip(raw,back))
            if tag=='path':
                nums=[float(n) for n in re.findall(r'-?\d+(?:\.\d+)?',attr['d'])]
                self.d.polygon([xy(nums[i],nums[i+1]) for i in range(0,len(nums),2)],fill=color)
            elif tag=='line':self.d.line([xy(attr['x1'],attr['y1']),xy(attr['x2'],attr['y2'])],fill=color,width=max(1,round(float(attr.get('stroke-width',1))*k*S)))
            else:
                cx=float(attr['cx']);cy=float(attr['cy']);r=float(attr['r']);box=[xy(cx-r,cy-r),xy(cx+r,cy+r)]
                self.d.ellipse(box,fill=color if attr.get('fill')!='none' else None,outline=color,width=max(1,round(float(attr.get('stroke-width',1))*k*S)))
        for c,dx,dy in [('N',.495,0),('S',.495,.98),('W',0,.49),('E',.99,.49)]:self.text(c,x+size*dx,y+size*dy,8 if self.mobile else 9,GOLD)
    def image(self,name,x,y,w,h=None,crop=False):
        source=Image.open(ROOT/'assets'/name).convert('RGB')
        height=round(w*source.height/source.width)
        source=source.resize((round(w*S),height*S),Image.Resampling.LANCZOS)
        if crop:source=source.crop((0,0,round(w*S),round(h*S)))
        self.im.paste(source,(round(x*S),round(y*S)))
        return y+(h if crop else height)
    def caption(self, node, x, y, width):
        self.text(txt(node.select_one('.figure-mark')),x,y,11,ROUTE,True)
        span = node.select('span')[-1]
        label = next(span.stripped_strings)
        y = self.para(label,x+23,y,width-23,11 if self.mobile else 12,NAVY,1.6)
        return self.para(txt(span.small),x+23,y+5,width-23,10,INK,1.7)

    def evidence(self, kind, x, y, width):
        mobile = self.mobile
        el = HTML.select_one('#'+kind)
        if kind in ('discover','diagnose'):
            self.eyebrow(txt(el.select_one('.figure-overline span')),x,y,INK,9 if mobile else 10)
            self.text('↗',x+width-15,y-2,16,INK)
            self.line(x,y+28,x+width,y+28)
            y += 46
            if kind == 'discover':
                height = 300 if mobile else 420
                self.rect(x,y,width,height,NAVY)
                self.image('report-screenshot.webp',x+4,y+4,width-8,height-8,True)
                return self.caption(el.figcaption,x,y+height+22,width)
            y = self.image('runner-screenshot.webp',x,y,width)+24
            for i,stat in enumerate(el.select('.evidence-details>span')):
                dx = x + i*(width+12)/3
                self.text(txt(stat.strong),dx,y,22 if mobile else 26,NAVY,True)
                label = list(stat.stripped_strings)[-1]
                self.para(label,dx,y+35,width/3-12,10 if mobile else 11,INK,1.6)
            y += 80
            self.line(x,y,x+width,y)
            y = self.caption(el.figcaption,x,y+22,width)+30
            summary = el.select_one('.assessment-summary')
            self.eyebrow(txt(summary.p),x,y,ROUTE)
            y += 28
            for item in summary.select('li'):
                y = self.para(txt(item),x,y,width,13 if mobile else 14,INK,1.7)+10
                self.line(x,y,x+width,y)
                y += 12
            return y
        if kind == 'build':
            story = el.select_one('.client-evidence')
            pad = 24 if mobile else 36
            xx = x+pad
            ww = width-2*pad
            def flow(draw=False):
                yy = y+pad
                if draw: self.eyebrow(txt(story.select_one('.eyebrow')),xx,yy,GOLD)
                yy += 42
                if draw: self.eyebrow(txt(story.select_one('.client-location')),xx,yy,MUTED,8 if mobile else 9)
                yy += 31
                yy = self.para(txt(story.h4),xx,yy,ww,34 if mobile else 42,CREAM,1.1,True,not draw)+18
                yy = self.para(txt(story.select_one('.client-lead')),xx,yy,ww,20 if mobile else 22,CREAM,1.4,True,not draw)+25
                for work in story.select('.client-work'):
                    if draw: self.line(xx,yy,xx+ww,yy,'#3c403d')
                    yy += 21
                    if draw: self.eyebrow(txt(work.span),xx,yy,GOLD,9)
                    yy += 25
                    yy = self.para(txt(work.p),xx,yy,ww,13 if mobile else 14,MUTED,1.8,False,not draw)+25
                if draw: self.text('+',xx,yy,26,GOLD)
                yy = self.para(txt(story.select_one('.client-result p')),xx+30,yy,ww-30,13 if mobile else 14,CREAM,1.7,False,not draw)
                return yy+pad
            bottom = flow()
            self.rect(x,y,width,bottom-y,NAVY)
            flow(True)
            self.line(x+width-30,y+14,x+width-14,y+14,ROUTE)
            self.line(x+width-14,y+14,x+width-14,y+30,ROUTE)
            return bottom
        panel = el.select_one('.partnership-evidence')
        self.eyebrow(txt(panel.select_one('.eyebrow')),x,y,ROUTE)
        y += 40
        y = self.para(multiline(panel.select_one('.partnership-statement')),x,y,width,29 if mobile else 39,NAVY,1.16,True)+25
        copy = panel.select_one('p:not(.eyebrow):not(.partnership-statement)')
        y = self.para(txt(copy),x,y,width,14 if mobile else 15,INK,1.8)+27
        self.line(x,y,x+width,y)
        self.text('+',x,y+18,24,ROUTE)
        return self.para(txt(panel.select_one('.partnership-foot')).lstrip('+ '),x+28,y+22,width-28,9,INK,1.8)+16

    def chapter_copy(self, el, x, y, width):
        mobile = self.mobile
        self.eyebrow(txt(el.select_one('.chapter-label')),x,y,ROUTE)
        self.diamond(x-(26 if mobile else 32),y+4)
        y += 32 if mobile else 36
        y = self.para(txt(el.h3),x,y,width,40 if mobile else 52,NAVY,1.05,True)+18
        y = self.para(txt(el.select_one('.offer')),x,y,width,18 if mobile else 20,NAVY,1.4,True)+16
        y = self.para(txt(el.select_one('.chapter-description')),x,y,width,14 if mobile else 15,INK,1.8)
        if el.select_one('.assessment-price'):
            price = el.select_one('.assessment-price')
            y += 24
            self.text(txt(price.strong),x,y,32 if mobile else 38,NAVY,True)
            dx = 121 if mobile else 145
            end = self.para(next(price.span.stripped_strings),x+dx,y,width-dx,12 if mobile else 13,NAVY,1.6,True)
            end = self.para(txt(price.small),x+dx,end+5,width-dx,10 if mobile else 11,INK,1.6)
            self.line(x+dx-16,y,x+dx-16,end)
            y = max(end,y+38)
        y += 25
        for row in el.select('.contributions>div'):
            self.line(x,y,x+width,y)
            y += 17
            if mobile:
                self.eyebrow(txt(row.dt),x,y,NAVY,9)
                y += 23
                y = self.para(txt(row.dd),x,y,width,14,INK,1.7)+17
            else:
                self.eyebrow(txt(row.dt),x,y+3,NAVY,9)
                y = self.para(txt(row.dd),x+128,y,width-128,14,INK,1.7)+17
        self.line(x,y,x+width,y)
        if el.select_one('.text-link'):
            y += 25
            label = txt(el.select_one('.text-link'))
            y = self.para(label,x,y,width,12 if mobile else 13,ROUTE,1.7,True)
            self.line(x,y+7,x+min(width,325),y+7,ROUTE)
            y += 21
        gate = el.select_one('.approval-gate')
        if gate:
            y += 26
            self.text('✓',x,y,18,ROUTE)
            y = self.para(txt(gate.strong),x+27,y,width-27,12 if mobile else 13,NAVY,1.7,True)+9
            y = self.para(list(gate.p.stripped_strings)[-1],x+27,y,width-27,12 if mobile else 13,NAVY,1.7)+18
            self.line(x,y,x+width,y)
        y += 25
        nxt = el.select_one('.next-stage')
        start = y
        y = self.para(txt(nxt.select_one('.eyebrow')),x+15,y,width-15,9 if mobile else 10,ROUTE,1.6,True)+8
        y = self.para(txt(nxt.p),x+15,y,width-15,13 if mobile else 14,INK,1.7)
        self.line(x,start,x,y,ROUTE,1.5)
        return y

    def path(self, points):
        coords = [points[0]]
        for a,b in zip(points,points[1:]):
            if abs(a[0]-b[0]) < 4:
                coords.append(b)
                continue
            bend = b[1]-85
            coords.append((a[0],bend-20))
            p0,p1,p2,p3=(a[0],bend-20),(a[0],bend+30),(b[0],bend-35),b
            for j in range(1,101):
                t=j/100; u=1-t
                coords.append((u**3*p0[0]+3*u*u*t*p1[0]+3*u*t*t*p2[0]+t**3*p3[0],u**3*p0[1]+3*u*u*t*p1[1]+3*u*t*t*p2[1]+t**3*p3[1]))
        overlay = Image.new('RGBA',self.im.size,(0,0,0,0))
        ImageDraw.Draw(overlay).line([(round(x*S),round(y*S)) for x,y in coords],fill=(121,99,33,85),width=2)
        self.im=Image.alpha_composite(self.im.convert('RGBA'),overlay).convert('RGB')
        self.d=ImageDraw.Draw(self.im)
        for i,(x,y) in enumerate(points[:-1]): self.diamond(x,y,ROUTE if i==0 else CREAM)

    def render(self):
        mobile=self.mobile; m=self.margin; cw=self.w-2*m
        self.brand(m,23 if mobile else 29)
        if mobile:
            self.line(self.w-54,33,self.w-30,33,GOLD)
            self.line(self.w-54,41,self.w-30,41,GOLD)
        else:
            for label,x in [('The Journey',580),('Our Work',704),('The Partnership',810)]: self.text(label,x,43,13,MUTED)
            self.text('Start your free scan  ↗',1202,43,13,CREAM)
        hy=76 if mobile else 100
        self.line(m,hy,self.w-m,hy,'#394039')
        y=hy+(36 if mobile else 68)
        self.eyebrow(content('.hero-copy .eyebrow'),m,y,GOLD)
        y+=39 if mobile else 48
        h1=HTML.select_one('h1')
        main=next(h1.stripped_strings)
        left_width=cw if mobile else (cw-44)*1.2/2.2
        y=self.para(main,m,y,left_width,38 if mobile else 60,CREAM,1.06,True)
        y=self.para(txt(h1.span),m,y,left_width,38 if mobile else 60,GOLD,1.06,True)+26
        y=self.para(content('.hero-description'),m,y,cw if mobile else 500,15 if mobile else 16,MUTED,1.75)+26
        y=self.button(m,y)
        note_end=self.para(content('.hero-note'),m,y+14,cw if mobile else 500,11 if mobile else 12,MUTED,1.7)
        if mobile:
            size=min(300,cw*.7)
            arty=note_end+30
            self.compass((self.w-size)/2,arty,size)
            y=arty+size+20
            self.eyebrow(content('.art-caption').lstrip('+ '),m+10,y,MUTED,8)
            y+=56
        else:
            self.compass(self.w-m-550,145,550)
            self.eyebrow(content('.art-caption').lstrip('+ '),self.w-m-480,714,MUTED,9)
            y=max(hy+680-61,note_end+70)
        self.line(m,y,self.w-m,y,'#394039')
        caption=content('.hero-bottom>span:first-child')
        self.para(caption,m,y+20,200 if mobile else 820,8 if mobile else 10,MUTED,1.7)
        self.text('Explore the journey  ↓',self.w-m-(128 if mobile else 162),y+20,11 if mobile else 12,CREAM)
        y+=64 if mobile else 61
        journey_y=y
        self.rect(0,y,self.w,10000,CREAM)
        y+=44 if mobile else 74
        self.eyebrow(content('.journey-intro .eyebrow'),m,y,ROUTE)
        y+=35 if mobile else 40
        if mobile:
            y=self.para(content('#journey-title'),m,y,cw,35,NAVY,1.1,True)+22
            y=self.para(content('.journey-intro>p'),m,y,cw,14,INK,1.8)+34
        else:
            self.text(content('#journey-title'),m,y,58,NAVY,True)
            end=self.para(content('.journey-intro>p'),860,y+3,self.w-m-860,15,INK,1.8)
            y=max(end,y+64)+58
        self.line(0,y,self.w,y)
        self.layout['journey_start']=journey_y
        if mobile:
            self.eyebrow('YOUR DESTINATION',m,y+14,ROUTE,8)
            self.text('A more system-driven business',m,y+30,12,NAVY,True)
            self.text('✧',self.w-m-23,y+19,27,ROUTE)
            for i,label in enumerate(['Discover','Diagnose','Build','Sustain']):
                self.text(label,m+i*(cw-47)/3,y+67,12,NAVY if i==0 else INK,i==0)
            y+=104
        else:
            self.eyebrow('CURRENT STAGE',m,y+25,INK,9)
            self.text(content('#current-chapter'),m,y+46,12,NAVY,True)
            for i,label in enumerate(['Discover','Diagnose','Build','Sustain']):
                self.text(label,530+i*90,y+38,13,NAVY if i==0 else INK,i==0)
            self.text('✧',1056,y+30,34,ROUTE)
            self.eyebrow('YOUR DESTINATION',1100,y+25,ROUTE,9)
            self.text('A more system-driven business',1100,y+46,13,NAVY,True)
            y+=96
        self.line(0,y,self.w,y)
        y+=36 if mobile else 48
        points=[(m+4 if mobile else m,y+4)]
        self.eyebrow(content('.origin .eyebrow'),m+26 if mobile else m+32,y,NAVY,10 if mobile else 11)
        y+=26
        y=self.para(content('.origin p'),m+26 if mobile else m+32,y,cw-26 if mobile else cw-32,13 if mobile else 14,INK,1.7)+(44 if mobile else 62)
        left=m+26 if mobile else m+32
        col=cw-26 if mobile else (cw-32-cw*.12)/2
        right=left+col+cw*.12
        self.layout['chapters']={}
        for i,el in enumerate(HTML.select('.chapter')):
            kind=el['id']; x=left if mobile or i%2==0 else right
            self.layout['chapters'][kind]=round(y)
            points.append((x-(26 if mobile else 32),y+4))
            end=self.chapter_copy(el,x,y,col)
            if mobile:
                end=self.evidence(kind,left,end+32,col)
            else:
                ex=right if i%2==0 else left
                ew=col
                if kind=='discover': ex+=col*.08; ew*=.92
                end=max(end,self.evidence(kind,ex,y+(28 if kind=='discover' else 38),ew))
            y=end+(68 if mobile else 112)
        finish=HTML.select_one('#destination')
        if mobile:
            points.append((m+4,y+44))
            self.text('✧',m-7,y+39,29,ROUTE)
            self.eyebrow(txt(finish.select_one('.eyebrow')),left,y+40,ROUTE)
            y+=76
            y=self.para(txt(finish.h3),left,y,col,30,NAVY,1.13,True)+18
            y=self.para(txt(finish.select_one('p:not(.eyebrow)')),left,y,col,14,INK,1.8)+24
            self.line(left,y,left+col,y)
            y=self.para(txt(finish.select_one('.continuation')),left,y+20,col,9,ROUTE,1.8)+44
        else:
            points.append((self.w/2,y))
            self.text('✧',self.w/2-17,y-15,36,ROUTE)
            y+=42
            label=txt(finish.select_one('.eyebrow'))
            self.eyebrow(label,(self.w-self.width(label,10,True))/2,y,ROUTE)
            y+=38
            label=txt(finish.h3)
            self.text(label,(self.w-self.width(label,49,True))/2,y,49,NAVY,True)
            y+=80
            label=txt(finish.select_one('p:not(.eyebrow)'))
            self.text(label,(self.w-self.width(label,15))/2,y,15,INK)
            y+=54
            label=txt(finish.select_one('.continuation'))
            self.eyebrow(label,(self.w-self.width(label,10,True))/2,y,ROUTE)
            y+=82
        self.path(points)
        self.rect(0,y,self.w,12000-y,NAVY)
        y+=44 if mobile else 66
        self.eyebrow(content('.more-work .eyebrow'),m,y,GOLD)
        start=y
        y+=36
        heading_end=self.para(content('.more-work h2'),m,y,cw if mobile else 430,31 if mobile else 38,CREAM,1.12,True)
        if mobile:
            y=heading_end+27;xx=m;ww=cw
        else:
            y=start+8;xx=right;ww=col
        self.eyebrow(content('.more-work .client-location'),xx,y,MUTED,10)
        y+=34
        y=self.para(content('.more-work-description'),xx,y,ww,14 if mobile else 16,CREAM,1.8)+19
        y=self.para(content('.more-work-note'),xx,y,ww,11,MUTED,1.7)
        y=max(y,heading_end)+(44 if mobile else 66)
        self.line(m,y,self.w-m,y,'#394039')
        y+=44 if mobile else 72
        self.eyebrow(content('.start-inner .eyebrow'),m,y,GOLD)
        y+=36;start=y
        y=self.para(content('.start-inner h2'),m,y,cw if mobile else 700,32 if mobile else 48,CREAM,1.12,True)+22
        y=self.para(content('.start-inner>div>p:last-child'),m,y,cw if mobile else 600,14 if mobile else 15,MUTED,1.8)
        if mobile:
            y=self.button(m,y+27)
            y=self.para(content('.start-action .micro'),m,y+16,cw,11,MUTED,1.7)+48
        else:
            self.button(self.w-m-390,start+5)
            self.text(content('.start-action .micro'),self.w-m-380,start+82,11,MUTED)
            y=max(y,start+100)+72
        self.line(m,y,self.w-m,y,'#394039')
        y+=30
        self.brand(m,y,True)
        self.para(content('footer>p'),m+171 if mobile else 535,y+4,175 if mobile else 540,11 if mobile else 12,MUTED,1.8)
        if mobile:
            y+=74;self.line(m,y-12,self.w-m,y-12,'#394039')
            self.eyebrow(content('footer>span'),m,y,MUTED,9);y+=35
        else:
            self.eyebrow(content('footer>span'),1120,y+10,MUTED,9);y+=70
        self.im=self.im.crop((0,0,self.w*S,round(y*S)))
        name='mobile' if mobile else 'desktop'
        self.layout.update(width=self.w,height=round(y),rendering='static concept artwork; not a browser screenshot')
        (ROOT/'review'/f'{name}-layout.json').write_text(json.dumps(self.layout,indent=2)+'\n')
        self.im.resize((self.w,round(y)),Image.Resampling.LANCZOS).save(ROOT/'review'/f'{name}-full.png')
        crop_height=1250 if mobile else 1450
        self.im.crop((0,round((journey_y-15)*S),self.w*S,round((journey_y+crop_height)*S))).resize((self.w,crop_height+15),Image.Resampling.LANCZOS).save(ROOT/'review'/f'{name}-journey.png')
        thumbw=260 if mobile else 620
        self.im.resize((thumbw,round(y*thumbw/self.w)),Image.Resampling.LANCZOS).save(ROOT/'review'/f'{name}-overview.png')
        print(name,self.w,round(y),'chapters',self.layout['chapters'],flush=True)

if __name__=='__main__':
    (ROOT/'review').mkdir(exist_ok=True)
    Board(1440,False).render()
    Board(390,True).render()
