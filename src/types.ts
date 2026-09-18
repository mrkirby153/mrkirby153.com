interface BaseComponent<T extends ComponentType> {
  type: T;
  id?: string;
}

export enum ComponentType {
  ActionRow = 1,
  Button = 2,
  Section = 9,
  TextDisplay = 10,
  Thumbnail = 11,
  MediaGallery = 12,
  File = 13,
  Separator = 14,
  Container = 17,
}

interface ActionRowComponent extends BaseComponent<ComponentType.ActionRow> {
  components: Component[];
}

export enum ButtonStyle {
  Primary = 1,
  Secondary = 2,
  Success = 3,
  Danger = 4,
  Link = 5,
  Premium = 6,
}

interface BaseButton extends BaseComponent<ComponentType.Button> {
  label?: string;
  emoji?: {
    name: string;
    id: string | null;
    animated?: boolean;
  };
  disabled?: boolean;
}

type CustomIdButton = BaseButton & {
  style:
    | ButtonStyle.Primary
    | ButtonStyle.Secondary
    | ButtonStyle.Success
    | ButtonStyle.Danger;
  custom_id: string;
};

type LinkButton = BaseButton & {
  style: ButtonStyle.Link;
  url: string;
};

type PremiumButton = BaseButton & {
  style: ButtonStyle.Premium;
  sku_id: string;
};

type ButtonComponent = CustomIdButton | LinkButton | PremiumButton;

type SectionChildComponent = TextDisplayComponent;
type SectionAccessoryComponent = ThumbnailComponent | ButtonComponent;

interface SectionComponent extends BaseComponent<ComponentType.Section> {
  components: SectionChildComponent[];
  accessory: SectionAccessoryComponent;
}

type UnfurlMediaItem = {
  url: string;
  proxy_url?: string;
  height?: number;
  width?: number;
  placeholder?: string;
  placeholder_version?: number;
  content_type?: string;
  flags?: number;
  attachment_id?: string;
};

interface ThumbnailComponent extends BaseComponent<ComponentType.Thumbnail> {
  media: UnfurlMediaItem;
  description?: string | null;
  spoiler?: boolean;
}

interface TextDisplayComponent extends BaseComponent<ComponentType.TextDisplay> {
  content: string;
}

interface SeparatorComponent extends BaseComponent<ComponentType.Separator> {
  divider?: boolean;
  spacing?: 1 | 2;
}

type ContainerChildComponents =
  | ActionRowComponent
  | TextDisplayComponent
  | SectionComponent
  | MediaGalleryComponent
  | SeparatorComponent
  | FileComponent;

interface ContainerComponent extends BaseComponent<ComponentType.Container> {
  components: ContainerChildComponents[];
  accent_color?: number;
  spoiler?: boolean;
}

type MediaGalleryItem = {
  media: UnfurlMediaItem;
  description?: string | null;
  spoiler?: boolean;
};

interface MediaGalleryComponent extends BaseComponent<ComponentType.MediaGallery> {
  items: MediaGalleryItem[];
}

interface FileComponent extends BaseComponent<ComponentType.File> {
  file: UnfurlMediaItem;
  spoiler?: boolean;
  name?: string;
  size?: number;
}

export type Component =
  | ActionRowComponent
  | ButtonComponent
  | SectionComponent
  | SeparatorComponent
  | ContainerComponent;
