# Layer and Scene Key

Use this depth order consistently:

1. Room shell / wall / floor — depth 0
2. Rear furniture and signs — depth 1–2
3. Lab equipment and science diagrams — depth 3–4
4. Scientists — depth 5
5. Uploaded media and short labels — depth 12
6. Glowing info icons — depth 15
7. Header — depth 20+
8. Dialogue area — depth 30+
9. Bottom quest path — depth 40+
10. NEXT button — depth 50+
11. Modal overlays — depth 100+

Canvas regions:

- Header: y 0–84
- Main scene: y 84–505
- Dialogue/action area: y 488–616
- Bottom quest path: y 618–720

Do not place important scene art beneath the dialogue box or bottom path.
