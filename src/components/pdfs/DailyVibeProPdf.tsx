import { Document, Page, Text, View } from "@react-pdf/renderer";
import { styles } from "./styles";
import type { DashaPdfContent } from "@/lib/prompts/dasha-pdf";

interface Props {
  content: DashaPdfContent;
  /** human-readable e.g. "Mumbai · 5 May 2026" */
  birthLabel: string;
  currentDashaLabel: string;
  generatedDateLabel: string;
}

export function DailyVibeProPdf({ content, birthLabel, currentDashaLabel, generatedDateLabel }: Props) {
  return (
    <Document
      title="halostar — 90-Day Dasha Reading"
      author="halostar"
      subject="A 90-day vedic reading for the user"
    >
      {/* COVER */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.wordmark}>halostar</Text>
          <Text style={styles.meta}>90-day reading</Text>
        </View>

        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text style={styles.meta}>For</Text>
          <Text style={[styles.body, { fontSize: 12, marginBottom: 32 }]}>{birthLabel}</Text>

          <Text style={styles.title}>{content.title}</Text>

          <View style={styles.hr} />

          <Text style={styles.sectionLabel}>Current Mahadasha</Text>
          <Text style={styles.body}>{currentDashaLabel}</Text>

          <Text style={styles.sectionLabel}>Reading Window</Text>
          <Text style={styles.body}>{generatedDateLabel} — and the 90 days that follow</Text>
        </View>

        <View style={styles.pageFooter}>
          <Text>halostar.in</Text>
          <Text>cover · 1</Text>
        </View>
      </Page>

      {/* OPENING LETTER */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.wordmark}>halostar</Text>
          <Text style={styles.meta}>opening</Text>
        </View>

        <Text style={styles.sectionLabel}>The Letter</Text>
        {content.openingLetter.split(/\n\n+/).map((para, i) => (
          <Text key={i} style={styles.serifBody}>
            {para.trim()}
          </Text>
        ))}

        <View style={styles.pageFooter}>
          <Text>halostar.in</Text>
          <Text>opening · 2</Text>
        </View>
      </Page>

      {/* WEEKS */}
      {chunkWeeks(content.weeks, 4).map((chunk, pageIdx) => (
        <Page key={pageIdx} size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.wordmark}>halostar</Text>
            <Text style={styles.meta}>the next 90 days · part {pageIdx + 1}</Text>
          </View>

          {chunk.map((w) => (
            <View key={w.weekNumber} style={styles.weekRow} wrap={false}>
              <View style={styles.weekHeader}>
                <Text style={styles.weekNumber}>week {w.weekNumber}</Text>
                <Text style={styles.weekDate}>{w.dateRange}</Text>
              </View>
              <Text style={styles.weekHeadline}>{w.headline}</Text>
              <Text style={styles.body}>{w.body}</Text>
            </View>
          ))}

          <View style={styles.pageFooter}>
            <Text>halostar.in</Text>
            <Text>weeks · {pageIdx + 3}</Text>
          </View>
        </Page>
      ))}

      {/* WARNINGS + OPENINGS + CLOSE */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.wordmark}>halostar</Text>
          <Text style={styles.meta}>tilts + close</Text>
        </View>

        <Text style={styles.sectionLabel}>Lean Into</Text>
        {content.openings.map((o, i) => (
          <View key={i} style={styles.callout}>
            <Text style={styles.body}>{o}</Text>
          </View>
        ))}

        <View style={styles.hr} />

        <Text style={styles.sectionLabel}>Watch For</Text>
        {content.warnings.map((w, i) => (
          <View key={i} style={styles.callout}>
            <Text style={styles.body}>{w}</Text>
          </View>
        ))}

        <View style={styles.hr} />

        <Text style={styles.sectionLabel}>Closing Note</Text>
        <Text style={styles.serifBody}>{content.closingNote}</Text>

        <View style={styles.pageFooter}>
          <Text>halostar.in · written for you</Text>
          <Text>close</Text>
        </View>
      </Page>
    </Document>
  );
}

function chunkWeeks<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}
