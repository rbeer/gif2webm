# check for transparency
# %m = format (GIF|PNG)
# %c = count (number of frames)
# %A = transparency (as Boolean)
identify -format 'f=%m;c=%n;t=%A' in.gif

# split to single frames (rgbA)
convert -coalesce in.gif frames%04d.gif
# (rgb)
convert in.gif frames%04d.gif

# encode single frames into webm
avconv -i frames%04d.gif -an -vcodec libvpx -crf 30 -threads 1 -b:v 3000k -f webm out.webm
