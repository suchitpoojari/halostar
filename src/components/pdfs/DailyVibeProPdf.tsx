import { Document, Page, Text, View } from "@react-pdf/renderer";
import { styles } from "./styles";
import type { DailyVibeDetailed } from "@/types/vedic";

interface Props {
  content: DailyVibeDetailed;
  /** human-readable e.g. "Mumbai · 5 May 2026 at 14:32" */
  birthLabel: string;
  currentDashaLabel: string;
  generatedDateLabel: string;
}

const SECTION_ORDER: Array<{
  key: keyof DailyVibeDetailed["sections"];
  label: string;
}> = [
  { key: "love", label: "Love" },
  { key: "relationships", label: "Relationships" },
  { key: "work", label: "Work" },
  { key: "finance", label: "Finance" },
  { key: "health", label: "Health" },
  { key: "mindset", label: "Mindset" },
];

export function DailyVibeProPdf({
  content,
  birthLabel,
  currentDashaLabel,
  generatedDateLabel,
}: Props) {
  return (
    <Document
      title="halostar — Today, Fully Unlocked"
      author="halostar"
      subject="Today's vedic horoscope, fully unlocked"
    >
      {/* COVER */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.wordmark}>halostar</Text>
          <Text style={styles.meta}>today, unlocked</Text>
        </View>

        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text style={styles.meta}>For</Text>
          <Text style={[styles.body, { fontSize: 12, marginBottom: 32 }]}>
            {birthLabel}
          </Text>

          <Text style={styles.title}>{content.title}</Text>

          <View style={styles.hr} />

          <Text style={styles.sectionLabel}>Date</Text>
          <Text style={styles.body}>{generatedDateLabel}</Text>

          <Text style={styles.sectionLabel}>Current Mahadasha</Text>
          <Text style={styles.body}>{currentDashaLabel}</Text>
        </View>

        <View style={styles.pageFooter}>
          <Text>halostar.in</Text>
          <Text>cover · 1</Text>
        </View>
      </Page>

      {/* INTRO */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.wordmark}>halostar</Text>
          <Text style={styles.meta}>opening</Text>
        </View>

        <Text style={styles.sectionLabel}>Today, Read In Full</Text>
        {content.intro.split(/\n\n+/).map((para, i) => (
          <Text key={i} style={styles.serifBody}>
            {para.trim()}
          </Text>
        ))}

        <View style={styles.pageFooter}>
          <Text>halostar.in</Text>
          <Text>opening · 2</Text>
        </View>
      </Page>

      {/* SECTIONS — 2 per page */}
      {chunk(SECTION_ORDER, 2).map((group, pi) => (
        <Page key={`section-${pi}`} size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.wordmark}>halostar</Text>
            <Text style={styles.meta}>today · part {pi + 1}</Text>
          </View>

          {group.map(({ key, label }) => {
            const s = content.sections[key];
            return (
              <View key={key} style={{ marginBottom: 22 }} wrap={false}>
                <View style={styles.weekHeader}>
                  <Text style={styles.weekNumber}>{label}</Text>
                </View>
                <Text style={styles.serifBody}>{s.detail}</Text>
                {s.moves.map((m, i) => (
                  <View key={i} style={styles.callout}>
                    <Text style={styles.body}>{m}</Text>
                  </View>
                ))}
              </View>
            );
          })}

          <View style={styles.pageFooter}>
            <Text>halostar.in</Text>
            <Text>sections · {pi + 3}</Text>
          </View>
        </Page>
      ))}

      {/* WINDOWS + MANTRA + CLOSE */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.wordmark}>halostar</Text>
          <Text style={styles.meta}>windows · close</Text>
        </View>

        <Text style={styles.sectionLabel}>Lucky Window</Text>
        <Text style={styles.serifBody}>{content.luckyWindow}</Text>

        <Text style={styles.sectionLabel}>Avoid Window</Text>
        <Text style={styles.serifBody}>{content.avoidWindow}</Text>

        <View style={styles.hr} />

        <Text style={styles.sectionLabel}>Today&rsquo;s Mantra</Text>
        <Text style={styles.title}>{content.mantra}</Text>

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

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}
