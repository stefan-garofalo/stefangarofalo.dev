# Skill validation

`skill-creator/scripts/quick_validate.py` imports PyYAML, but the system and bundled Codex Python runtimes do not provide it. Run the validator in an environment that already has PyYAML. A cached `uv` package can be supplied through `PYTHONPATH`, but verify its path first because cache keys can change.
