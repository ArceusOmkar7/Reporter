from dataclasses import dataclass


@dataclass
class Categories:
    """Class representing a category."""
    __tablename__ = "categories"
    category_id: int
    category_name: str
    category_description: str
