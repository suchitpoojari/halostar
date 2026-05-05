import { Document, Page, Text, View } from "@react-pdf/renderer";
import { styles } from "./styles";
import type { MatchPdfContent } from "@/lib/prompts/match-pdf";

interface Props {
  content: MatchPdfContent;
  boyLabel: string;
  girlLabel: string;
  ashtakootRaw: number;
  generatedDateLabel: string;
}

export function MatchProPdf({ content, boyLabel, girlLabel, ashtakootRaw, generatedDateLabel }: Props) {
  return (
    <Document title="halostar — Full Compatibility Report" author="halostar">
      {/* COVER */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.wordmark}>halostar</Text>
          <Text style={styles.meta}>full compatibility report</Text>
        </View>

        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text style={styles.meta}>For</Text>
          <Text style={[styles.body, { fontSize: 12 }]}>{boyLabel}</Text>
          <Text style={[styles.body, { fontSize: 12, marginBottom: 32 }]}>&nbsp;&nbsp;&amp; {girlLabel}</Text>

          <Text style={styles.title}>{content.title}</Text>
          <Text style={styles.subtitle}>{content.headline}</Text>

          <View style={styles.hr} />

          <Text style={styles.sectionLabel}>Ashtakoot Total</Text>
          <Text style={styles.body}>{ashtakootRaw} / 36</Text>

          <Text style={styles.sectionLabel}>Generated</Text>
          <Text style={styles.body}>{generatedDateLabel}</Text>
        </View>

        <View style={styles.pageFooter}>
          <Text>halostar.in</Text>
          <Text>cover · 1</Text>
        </View>
      </Page>

      {/* ASHTAKOOT BREAKDOWN — split into 2 pages, 4 koots each */}
      {chunk(content.ashtakootBreakdown, 4).map((group, pi) => (
        <Page key={`koot-${pi}`} size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.wordmark}>halostar</Text>
            <Text style={styles.meta}>ashtakoot · part {pi + 1}</Text>
          </View>

          {group.map((k) => (
            <View key={k.koot} style={{ marginBottom: 22 }} wrap={false}>
              <View style={styles.weekHeader}>
                <Text style={styles.weekNumber}>{k.koot}</Text>
                <Text style={styles.weekDate}>{k.scoreLabel}</Text>
              </View>
              <Text style={styles.weekHeadline}>{k.title}</Text>
              <Text style={styles.serifBody}>{k.explanation}</Text>
            </View>
          ))}

          <View style={styles.pageFooter}>
            <Text>halostar.in</Text>
            <Text>koots · {pi + 2}</Text>
          </View>
        </Page>
      ))}

      {/* DOSHA + TIMING */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.wordmark}>halostar</Text>
          <Text style={styles.meta}>dosha · timing</Text>
        </View>

        <Text style={styles.sectionLabel}>Dosha Check</Text>
        <Text style={styles.serifBody}>{content.doshaCheck.summary}</Text>
        <Text style={styles.sectionLabel}>Mangal</Text>
        <Text style={styles.body}>{content.doshaCheck.mangalNote}</Text>
        <Text style={styles.sectionLabel}>Nadi</Text>
        <Text style={styles.body}>{content.doshaCheck.nadiNote}</Text>

        <View style={styles.hr} />

        <Text style={styles.sectionLabel}>Marriage Timing Window</Text>
        <Text style={styles.subtitle}>{content.marriageTimingWindow.headline}</Text>
        <Text style={styles.serifBody}>{content.marriageTimingWindow.body}</Text>

        <View style={styles.pageFooter}>
          <Text>halostar.in</Text>
          <Text>dosha · timing</Text>
        </View>
      </Page>

      {/* FIGHT DECODER */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.wordmark}>halostar</Text>
          <Text style={styles.meta}>fight without breakup</Text>
        </View>

        <Text style={styles.subtitle}>{content.fightDecoder.headline}</Text>
        <Text style={styles.serifBody}>{content.fightDecoder.intro}</Text>

        <View style={styles.hr} />

        {content.fightDecoder.patterns.map((p, i) => (
          <View key={i} style={{ marginBottom: 18 }} wrap={false}>
            <Text style={styles.sectionLabel}>Pattern {i + 1} · trigger</Text>
            <Text style={styles.body}>{p.trigger}</Text>
            <Text style={styles.sectionLabel}>spiral</Text>
            <Text style={styles.body}>{p.spiral}</Text>
            <Text style={styles.sectionLabel}>de-escalation</Text>
            <Text style={styles.body}>{p.deescalation}</Text>
          </View>
        ))}

        <View style={styles.pageFooter}>
          <Text>halostar.in</Text>
          <Text>fight decoder</Text>
        </View>
      </Page>

      {/* VERDICT */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.wordmark}>halostar</Text>
          <Text style={styles.meta}>verdict</Text>
        </View>

        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text style={styles.sectionLabel}>The Read</Text>
          <Text style={styles.title}>{content.verdict.headline}</Text>
          <Text style={styles.serifBody}>{content.verdict.body}</Text>
        </View>

        <View style={styles.pageFooter}>
          <Text>halostar.in · written for you</Text>
          <Text>verdict</Text>
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
