/**
 * Icon library for the deck.
 *
 * Every diagram refers to icons by these semantic names (via <GeoIcon name="..."/>),
 * so swapping the artwork for a concept happens here and nowhere else.
 */
import type { Component } from 'vue'

import Laptop from '~icons/carbon/laptop'
import Server from '~icons/mdi/server'
import FolderNetwork from '~icons/mdi/folder-network'
import ObjectStorage from '~icons/carbon/object-storage'
import Compute from '~icons/carbon/chip'
import Cloud from '~icons/carbon/cloud'
import Internet from '~icons/mdi/web'
import Database from '~icons/carbon/data-base'
import Layers from '~icons/carbon/layers'
import LayersEdit from '~icons/mdi/layers-edit'
import Image from '~icons/carbon/image'
import MapIcon from '~icons/carbon/map'
import FileImage from '~icons/mdi/file-image'
import Send from '~icons/carbon/send'
import Download from '~icons/carbon/download'
import Grid from '~icons/mdi/grid'
import Code from '~icons/carbon/code'
import Terminal from '~icons/carbon/terminal'
import Hand from '~icons/mdi/hand-back-right'
import Car from '~icons/mdi/car'
import Truck from '~icons/mdi/truck'
import Memory from '~icons/mdi/memory'
import Harddisk from '~icons/mdi/harddisk'
import Nas from '~icons/mdi/nas'
import Search from '~icons/carbon/search'
import Calendar from '~icons/carbon/calendar'
import Palette from '~icons/mdi/palette'
import Filter from '~icons/carbon/filter'
import Package from '~icons/mdi/package-variant-closed'
import Warning from '~icons/carbon/warning'
import Browser from '~icons/carbon/application-web'
import Rerun from '~icons/carbon/renew'
import Cache from '~icons/carbon/archive'
import Cdn from '~icons/carbon/edge-node'
import Cloudflare from '~icons/logos/cloudflare-icon'
import Cloudfront from '~icons/logos/aws-cloudfront'

export const icons = {
  // where things run
  'laptop': Laptop,
  'server': Server, // institutional server
  'ftp': FolderNetwork, // FTP / remote file share
  'storage': ObjectStorage, // any remote storage (on-prem or cloud)
  'compute': Compute,
  'cloud': Cloud,
  'internet': Internet,
  'browser': Browser, // web browser
  'cdn': Cdn, // content delivery network node
  // the mapping pipeline
  'raw-data': Database,
  'layer': Layers,
  'processed-layer': LayersEdit,
  'image': Image,
  'gis': MapIcon,
  'file-tif': FileImage,
  // actions / misc
  'request': Send,
  'download': Download,
  'tiles': Grid,
  'code': Code,
  'terminal': Terminal,
  'search': Search,
  'calendar': Calendar,
  'palette': Palette,
  'subset': Filter,
  'package': Package,
  'warning': Warning,
  'rerun': Rerun,
  'cache': Cache,
  // vendor logos (keep their own colors)
  'cloudflare': Cloudflare,
  'cloudfront': Cloudfront,
  // moving analogy + storage tiers
  'hand': Hand,
  'car': Car,
  'truck': Truck,
  'ram': Memory,
  'ssd': Nas,
  'hdd': Harddisk,
} satisfies Record<string, Component>

export type IconName = keyof typeof icons
