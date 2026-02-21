#!/usr/bin/env python3
"""
Fix closing tags: find each <SubPanel ...> and replace its matching closing </div> with </SubPanel>
"""

filepath = 'client/src/pages/admin/super/Design.tsx'

with open(filepath, 'r') as f:
    lines = f.readlines()

# Find all SubPanel opening lines and their indentation
subpanel_opens = []
for i, line in enumerate(lines):
    stripped = line.lstrip()
    if stripped.startswith('<SubPanel id='):
        indent = len(line) - len(stripped)
        subpanel_opens.append((i, indent))

print(f"Found {len(subpanel_opens)} SubPanel openings")

# For each SubPanel opening, find its matching closing </div>
# by tracking nesting depth at the same indentation level
changes = []  # (line_index, old_text, new_text)

for open_idx, open_indent in subpanel_opens:
    # Track nesting: we need to find the </div> at the same indent level
    # that closes this SubPanel's content
    depth = 0
    found = False
    for j in range(open_idx + 1, len(lines)):
        line = lines[j]
        stripped = line.lstrip()
        current_indent = len(line) - len(stripped)
        
        # Count div opens and closes at this and deeper levels
        # We're looking for the </div> at open_indent level
        if current_indent == open_indent and stripped.startswith('</div>'):
            if depth == 0:
                # This is our matching close
                new_line = line.replace('</div>', '</SubPanel>')
                changes.append((j, line, new_line))
                found = True
                break
        
        # Track nesting of divs at deeper levels
        if stripped.startswith('<div') and not stripped.startswith('<div className="flex'):
            # Only count structural divs
            pass
        
        # Simpler approach: just count all <div and </div> at deeper indent
        if current_indent > open_indent:
            continue
        elif current_indent == open_indent:
            if stripped.startswith('</div>'):
                # This is our match
                new_line = line.replace('</div>', '</SubPanel>')
                changes.append((j, line, new_line))
                found = True
                break
    
    if not found:
        print(f"WARNING: No matching close found for SubPanel at line {open_idx + 1}")

# Apply changes (in reverse order to preserve line numbers)
for line_idx, old_text, new_text in reversed(changes):
    lines[line_idx] = new_text

with open(filepath, 'w') as f:
    f.writelines(lines)

print(f"Fixed {len(changes)} closing tags")
