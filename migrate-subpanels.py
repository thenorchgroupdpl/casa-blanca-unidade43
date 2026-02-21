#!/usr/bin/env python3
"""
Migrate old sub-panel divs to SubPanel accordion components.
Pattern:
  <div className="space-y-2 rounded-lg bg-zinc-800/30 border border-zinc-700/50 p-3">
    <Label className="text-[11px] text-zinc-300 uppercase tracking-wider font-semibold">TITLE</Label>
    ...content...
  </div>

Becomes:
  <SubPanel id="section-title" title="TITLE">
    ...content...
  </SubPanel>
"""
import re

filepath = 'client/src/pages/admin/super/Design.tsx'

with open(filepath, 'r') as f:
    content = f.read()

# Pattern: find the opening div + Label line
# We need to replace:
# 1. <div className="space-y-2 rounded-lg bg-zinc-800/30 border border-zinc-700/50 p-3">
#    <Label className="text-[11px] text-zinc-300 uppercase tracking-wider font-semibold">TITLE</Label>
# With:
#    <SubPanel id="auto-ID" title="TITLE">

counter = [0]

def replace_opening(match):
    counter[0] += 1
    indent = match.group(1)
    title = match.group(2)
    # Create a slug from the title
    slug = title.lower()
    slug = re.sub(r'[^a-z0-9]+', '-', slug).strip('-')
    slug = slug[:30]  # limit length
    return f'{indent}<SubPanel id="{slug}" title="{title}">'

# Match the div + Label pattern
pattern = r'(\s*)<div className="space-y-2 rounded-lg bg-zinc-800/30 border border-zinc-700/50 p-3">\n\s*<Label className="text-\[11px\] text-zinc-300 uppercase tracking-wider font-semibold">(.*?)</Label>'

content = re.sub(pattern, replace_opening, content)

# Now we need to replace the closing </div> for each SubPanel
# This is trickier - we need to find the matching closing div
# Instead, let's count how many replacements we made and note that
# the closing </div> that was the container needs to become </SubPanel>

print(f"Replaced {counter[0]} opening patterns")

# For the closing tags, we need a different approach.
# Let's find all SubPanel openings and track their closing divs
# Actually, let's use a simpler approach: find lines that have just </div> 
# and are at the right indentation level after a SubPanel

# Write intermediate result
with open(filepath, 'w') as f:
    f.write(content)

print("Phase 1 complete - openings replaced. Closing divs need manual fix.")
