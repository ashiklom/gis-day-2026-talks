---
# try also 'default' to start simple
theme: seriph
# random image from a curated Unsplash collection by Anthony
# like them? see https://unsplash.com/collections/94734566/slidev
# background: https://cover.sli.dev
# some information about your slides (markdown enabled)
title: GIS day lunch on New Haven
info: |
  ## Slidev Starter Template
  Presentation slides for developers.

  Learn more at [Sli.dev](https://sli.dev)
# apply UnoCSS classes to the current slide
class: text-center
# https://sli.dev/features/drawing
drawings:
  persist: false
# slide transition: https://sli.dev/guide/animations.html#slide-transitions
transition: fade-out
# enable Comark Syntax: https://comark.dev/syntax/markdown
comark: true
# duration of the presentation
duration: 35min
---

# From the ivory tower to the city block

How can the Yale Center for Geospatial Solutions help New Haven decision makers?

Alexey N. Shiklomanov · Research Software Engineer<br>
Yale Center for Geospatial Solutions<br>
New Haven GIS day · November 16, 2026

<!--
The last comment block of each slide will be treated as slide notes. It will be visible and editable in Presenter Mode along with the slide. [Read more in the docs](https://sli.dev/guide/syntax.html#notes)
-->

---
layout: two-cols-header
---

# Outline

::left::

<ol>

<v-click><li>
What we showed you
</li>
</v-click>

<v-click><li>
What (some of) you told us<br>
(or, at least, what we heard)
</li>
</v-click>

<v-click><li>
Where we think we should go next
</li></v-click>

<v-click><li>
<b>What do you think?</b>
</li></v-click>
</ol>

::right::

<v-click>
<img
src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExc3RiYXFxMmxuZDFoY2p1a2NvcjEzbDFjMDMzdTNkem9jcG9hdG1hYiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/CsXhj0K1Brwje/giphy.gif"
alt="Help me help you GIF"
>
</v-click>

---
layout: center
---

# What we showed you

<div style="display: flex; justify-content: center;">
  <img 
  src="./assets/bowerbird.png"
  alt="YCGS Bowerbird screenshot"
  style="max-width: 85%;"
  >
</div>
<a href="https://d3eu3eflreofpm.cloudfront.net/" style="">Link</a>

<!--
Interactive demo of Bowerbird.

High-resolution data. You can even get some historical context!
NAIP gets you every few years.
Planet gets you every month (and more, if you pay).
Landsat every few weeks (-ish, ignoring clouds)...but it goes back 50 years.

Here, you start to lose interest because the resolution is coarse...but we can start.

Urban heat --- Landsat thermal vs. OSM, with opacity

Topography --- Hillshade/DEM vs. OSM, with opacity

-->

---
layout: two-cols-header
---

# What we heard from you

::left::

<v-clicks>

About our tool:

- High resolution is all that matters. Even 30m is useless, let alone >=100m.

- We don't have time to learn a new tool. We have real work to do!

- Pixels vs. people: Where are the human dimension data?

</v-clicks>

::right::

<v-clicks>

About other stuff:

- Our use cases have strict liability. Who do we sue if these data are wrong?

- A lot of our data aren't spatial (yet), so we can't do any GIS on them.

</v-clicks>

---

![Defenstration of Prague](https://byzantium-blogger.blog/wp-content/uploads/2020/11/unnamed-1.jpg)
Defenstration of Prague, 1618.
