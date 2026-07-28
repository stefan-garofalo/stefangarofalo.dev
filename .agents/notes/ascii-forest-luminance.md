# ASCII forest luminance calibration

The homepage forest source uses a custom Unicode grayscale ramp. Generic visual-density ordering destroys the pine silhouettes, especially across block, smiley, heart, and suit glyphs.

The source was calibrated against the supplied reference image downsampled to the same 220x66 grid. Preserve this dark-to-bright order:

```text
 .,:;i1tIl|!+~=<>*#MW&%@$█▓▒░☺☻♥♦♣♠
```

Keep the source polarity for the dark homepage: the dim textured sky defines darker tree silhouettes. Use a separate restrained edge-detail pass for visible branches instead of inverting or filling the trees into dense `@` masses.
