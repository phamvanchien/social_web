"use client";
import { useEffect, useRef } from "react";

interface EmojiPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
}

const emojiCategories = [
  {
    name: "Mặt cười",
    emojis: ["😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙", "🥲", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥", "😌", "😔", "😪", "🤤", "😴", "😷"]
  },
  {
    name: "Cảm xúc",
    emojis: ["😮", "😯", "😲", "😳", "🥺", "😦", "😧", "😨", "😰", "😥", "😢", "😭", "😱", "😖", "😣", "😞", "😓", "😩", "😫", "🥱", "😤", "😡", "😠", "🤬", "😈", "👿", "💀", "☠️", "💩", "🤡", "👹", "👺", "👻", "👽", "👾", "🤖"]
  },
  {
    name: "Tim & Tình yêu",
    emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "♥️", "💋", "💌", "💐", "🌹", "🥀", "🌷", "🌸", "💮", "🏵️", "🌻", "🌼"]
  },
  {
    name: "Cử chỉ",
    emojis: ["👍", "👎", "👊", "✊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "👇", "☝️", "✋", "🤚", "🖐️", "🖖", "👋", "🤏", "✍️", "🦾", "💪"]
  },
  {
    name: "Động vật",
    emojis: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🙈", "🙉", "🙊", "🐔", "🐧", "🐦", "🐤", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🦋"]
  },
  {
    name: "Đồ ăn",
    emojis: ["🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🥑", "🍔", "🍟", "🍕", "🌭", "🥪", "🌮", "🍜", "🍝", "🍣", "🍱", "🍩", "🍪", "🎂", "🍰"]
  },
  {
    name: "Hoạt động",
    emojis: ["⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱", "🏓", "🏸", "🏒", "🥅", "⛳", "🏹", "🎣", "🥊", "🥋", "🎿", "⛷️", "🏂", "🏋️", "🚴", "🏊", "🧘", "🎮", "🎯", "🎲", "🎪", "🎭", "🎨"]
  },
  {
    name: "Du lịch",
    emojis: ["🚗", "🚕", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐", "🛻", "🚚", "🚛", "🚜", "✈️", "🚀", "🛸", "🚁", "🛶", "⛵", "🚤", "🛳️", "🗼", "🗽", "🏰", "🏯", "🏟️", "🎡", "🎢", "🌋", "🏝️", "🏖️", "⛱️"]
  }
];

const EmojiPicker = ({ open, onClose, onSelect }: EmojiPickerProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="absolute bottom-full right-0 mb-2 w-[320px] bg-white rounded-xl shadow-lg border border-gray-200 z-50"
    >
      <div className="p-2 max-h-[300px] overflow-y-auto">
        {emojiCategories.map((category) => (
          <div key={category.name} className="mb-3">
            <div className="text-[12px] font-medium text-gray-500 px-1 mb-1">
              {category.name}
            </div>
            <div className="grid grid-cols-8 gap-0.5">
              {category.emojis.map((emoji, index) => (
                <button
                  key={index}
                  type="button"
                  className="w-8 h-8 flex items-center justify-center text-xl hover:bg-gray-100 rounded transition"
                  onClick={() => {
                    onSelect(emoji);
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmojiPicker;
