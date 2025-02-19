import json
import os
import re
from collections import namedtuple
from pathlib import Path
from typing import Iterator

import click
import pandas as pd

DialogFile = namedtuple('DialogFile', ['season', 'episode', 'file_path'])


def iter_dialog_files(idir: Path) -> Iterator[DialogFile]:
    pattern = re.compile(r"第(\d+)季第(\d+)集.*-中英台词\.xlsx")

    for file_path in Path(idir).rglob("*.xlsx"):
        filename = file_path.name
        match = pattern.match(filename)
        if match:
            season, episode = match.groups()
            yield DialogFile(season, episode, file_path)


def generate_dialog_file(dialog_file: DialogFile, odir: Path):
    df = pd.read_excel(dialog_file.file_path, names=["en", "zh"])

    data = []
    for index, row in df.iterrows():
        row_dict = row.to_dict()
        if index == 0 and re.match(r"第\d+季第\d+集\d+", row_dict["zh"]):
            row_dict["zh"] = row_dict["zh"].split("集", 1)[1].strip()
        data.append(row_dict)

    ofile = os.path.join(
        odir, f"{dialog_file.season}-{dialog_file.episode}.json"
    )
    with open(ofile, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


@click.command()
@click.option("--idir", type=click.Path(exists=True), help="Input directory")
@click.option("--odir", type=click.Path(), default="./public/dialogs", help="Output directory")
def main(idir, odir):
    if not os.path.exists(odir):
        os.makedirs(odir)

    for dialog_file in iter_dialog_files(idir):
        generate_dialog_file(dialog_file, odir)


if __name__ == "__main__":
    main()
