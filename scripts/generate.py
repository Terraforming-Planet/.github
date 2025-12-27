#!/usr/bin/env python3
import argparse
import base64
import json
from datetime import datetime
from pathlib import Path

from openai import OpenAI

TERRAIN_TEMPLATE = (
    "Stwórz dwuczęściową kompozycję 'before/after' obok siebie (before po lewej, after po prawej).\n"
    "Temat: terraformowanie terenu.\n"
    "Parametry: klimat {climate}, geologia {geology}, skala {scale}, styl {style}.\n"
    "Before: surowy teren bez infrastruktury, z atmosferą odpowiadającą podanym parametrom.\n"
    "After: ten sam kadr po terraformowaniu, z poprawioną atmosferą, roślinnością i śladami infrastruktury.\n"
    "Spójne oświetlenie i perspektywa, czytelny podział na dwie połowy.\n"
)

ROVER_TEMPLATE = (
    "Stwórz scenę z PV Roverem (pojazd badawczy z dużymi panelami fotowoltaicznymi) na obcym terenie.\n"
    "Parametry: klimat {climate}, geologia {geology}, skala {scale}, styl {style}.\n"
    "Pojazd dopasowany do warunków: pył, niskie światło, ślady eksploatacji.\n"
    "Ujęcie dynamiczne, ale realistyczne, z naciskiem na panele PV i funkcjonalność pojazdu.\n"
)


def build_prompt(mode: str, climate: str, geology: str, scale: str, style: str, notes: str | None) -> str:
    if mode == "terrain":
        prompt = TERRAIN_TEMPLATE.format(
            climate=climate,
            geology=geology,
            scale=scale,
            style=style,
        )
    elif mode == "rover":
        prompt = ROVER_TEMPLATE.format(
            climate=climate,
            geology=geology,
            scale=scale,
            style=style,
        )
    else:
        raise ValueError(f"Nieznany tryb: {mode}")

    if notes:
        prompt += f"Dodatkowe wskazówki: {notes.strip()}\n"
    return prompt.strip()


def save_outputs(output_dir: Path, image_bytes: bytes, prompt: str, params: dict) -> tuple[Path, Path]:
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    output_dir.mkdir(parents=True, exist_ok=True)
    image_path = output_dir / f"terraform_{timestamp}.png"
    metadata_path = output_dir / f"terraform_{timestamp}.json"

    image_path.write_bytes(image_bytes)
    metadata = {
        "prompt": prompt,
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "parameters": params,
        "image_file": image_path.name,
    }
    metadata_path.write_text(json.dumps(metadata, indent=2, ensure_ascii=False))
    return image_path, metadata_path


def generate_image(prompt: str) -> bytes:
    client = OpenAI()
    response = client.images.generate(
        model="gpt-images-1",
        prompt=prompt,
        size="1024x1024",
    )
    image_b64 = response.data[0].b64_json
    return base64.b64decode(image_b64)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate terraform prompts and images.")
    parser.add_argument("--mode", choices=["terrain", "rover"], default="terrain")
    parser.add_argument("--climate", choices=["suchy", "umiarkowany", "mroźny"], default="suchy")
    parser.add_argument("--geology", choices=["kraterowy", "kanionowy", "równiny"], default="kraterowy")
    parser.add_argument("--scale", choices=["makro", "mezzo", "mikro"], default="makro")
    parser.add_argument("--style", choices=["realistyczny", "koncept art"], default="realistyczny")
    parser.add_argument("--notes", default="", help="Dodatkowe wskazówki do promptu.")
    parser.add_argument("--output-dir", default="outputs", help="Folder na wygenerowane pliki.")
    parser.add_argument("--dry-run", action="store_true", help="Tylko wypisz prompt bez generowania obrazu.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    prompt = build_prompt(
        mode=args.mode,
        climate=args.climate,
        geology=args.geology,
        scale=args.scale,
        style=args.style,
        notes=args.notes,
    )

    if args.dry_run:
        print(prompt)
        return

    image_bytes = generate_image(prompt)
    image_path, metadata_path = save_outputs(
        Path(args.output_dir),
        image_bytes,
        prompt,
        {
            "mode": args.mode,
            "climate": args.climate,
            "geology": args.geology,
            "scale": args.scale,
            "style": args.style,
            "notes": args.notes,
        },
    )

    print(f"Saved image: {image_path}")
    print(f"Saved metadata: {metadata_path}")


if __name__ == "__main__":
    main()
