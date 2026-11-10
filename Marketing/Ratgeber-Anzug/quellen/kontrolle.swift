// Rendert jede PDF-Seite mit PDFKit (wie die macOS-Vorschau) als PNG.
// Aufruf: swift kontrolle.swift <pdf> <zielordner>
import PDFKit
import AppKit

let args = CommandLine.arguments
guard args.count >= 3, let doc = PDFDocument(url: URL(fileURLWithPath: args[1])) else {
  print("Aufruf: swift kontrolle.swift <pdf> <zielordner>"); exit(1)
}
let ziel = URL(fileURLWithPath: args[2])
try? FileManager.default.createDirectory(at: ziel, withIntermediateDirectories: true)
print("Seiten: \(doc.pageCount)")
for i in 0..<doc.pageCount {
  guard let page = doc.page(at: i) else { continue }
  let box = page.bounds(for: .mediaBox)
  let scale: CGFloat = 1100 / box.height
  let size = NSSize(width: box.width * scale, height: box.height * scale)
  let img = page.thumbnail(of: size, for: .mediaBox)
  guard let tiff = img.tiffRepresentation, let rep = NSBitmapImageRep(data: tiff),
        let png = rep.representation(using: .png, properties: [:]) else { continue }
  let datei = ziel.appendingPathComponent(String(format: "seite-%02d.png", i + 1))
  try? png.write(to: datei)
  print(datei.path)
}
