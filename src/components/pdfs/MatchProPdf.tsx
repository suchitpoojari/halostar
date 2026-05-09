import { Document, Page, Text, View } from "@react-pdf/renderer";
import { styles } from "./styles";
import type { CompatibilityDetailed } from "@/types/vedic";

interface Props {
  content: CompatibilityDetailed;
  boyLabel: string;
  girlLabel: string;
  ashtakootRaw: number;
  generatedDateLabel: string;
}

export function MatchProPdf({
  content,
  boyLabel,
  girlLabel,
  ashtakootRaw,
  generatedDateLabel,
}: Props) {
  return (
    <Document title="halostar — Full Compatibility, Unlocked" author="halostar">
      {/* COVER */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.wordmark}>halostar</Text>
          <Text style={styles.meta}>full compatibility · unlocked</Text>
        </View>

        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text style={styles.meta}>For</Text>
          <Text style={[styles.body, { fontSize: 12 }]}>{boyLabel}</Text>
          <Text style={[styles.body, { fontSize: 12, marginBottom: 32 }]}>
            &nbsp;&nbsp;&amp; {girlLabel}
          </Text>

          <Text style={styles.title}>{content.title}</Text>

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

      {/* INTRO */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.wordmark}>halostar</Text>
          <Text style={styles.meta}>opening</Text>
        </View>

        <Text style={styles.sectionLabel}>The Two Of You</Text>
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

      {/* KOOTS — 4 per page */}
      {chunk(content.koots, 4).map((group, pi) => (
        <Page key={`koot-${pi}`} size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.wordmark}>halostar</Text>
            <Text style={styles.meta}>ashtakoot · part {pi + 1}</Text>
          </View>

          {group.map((k) => (
            <View key={k.name} style={{ marginBottom: 22 }} wrap={false}>
              <View style={styles.weekHeader}>
                <Text style={styles.weekNumber}>{k.name}</Text>
                <Text style={styles.weekDate}>
                  {k.score} / {k.outOf}
                </Text>
              </View>
              <Text style={styles.serifBody}>{k.read}</Text>
            </View>
          ))}

          <View style={styles.pageFooter}>
            <Text>halostar.in</Text>
            <Text>koots · {pi + 3}</Text>
          </View>
        </Page>
      ))}

      {/* DOSHA + LONG GAME */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.wordmark}>halostar</Text>
          <Text style={styles.meta}>dosha · long game</Text>
        </View>

        <Text style={styles.sectionLabel}>Mangal Check</Text>
        <Text style={styles.serifBody}>{content.mangal}</Text>

        <Text style={styles.sectionLabel}>Nadi Check</Text>
        <Text style={styles.serifBody}>{content.nadi}</Text>

        <View style={styles.hr} />

        <Text style={styles.sectionLabel}>The Long Game</Text>
        <Text style={styles.serifBody}>{content.longGame}</Text>

        <View style={styles.pageFooter}>
          <Text>halostar.in</Text>
          <Text>dosha · long game</Text>
        </View>
      </Page>

      {/* FIGHT DECODER + PRACTICES */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.wordmark}>halostar</Text>
          <Text style={styles.meta}>fight + repair</Text>
        </View>

        <Text style={styles.sectionLabel}>Fight Without Breakup</Text>
        <Text style={styles.serifBody}>{content.fightDecoder}</Text>

        <View style={styles.hr} />

        <Text style={styles.sectionLabel}>Practices</Text>
        {content.practices.map((p, i) => (
          <View key={i} style={styles.callout}>
            <Text style={styles.body}>{p}</Text>
          </View>
        ))}

        <View style={styles.pageFooter}>
          <Text>halostar.in</Text>
          <Text>fight · practices</Text>
        </View>
      </Page>

      {/* MARRIAGE WINDOW + CLOSE */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.wordmark}>halostar</Text>
          <Text style={styles.meta}>timing · close</Text>
        </View>

        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text style={styles.sectionLabel}>If You&rsquo;re Considering Marriage</Text>
          <Text style={styles.serifBody}>{content.marriageWindow}</Text>

          <View style={styles.hr} />

          <Text style={styles.sectionLabel}>Closing Note</Text>
          <Text style={styles.serifBody}>{content.closingNote}</Text>
        </View>

        <View style={styles.pageFooter}>
          <Text>halostar.in · written for the two of you</Text>
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
