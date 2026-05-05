import { StyleSheet } from "@react-pdf/renderer";

/**
 * halostar PDF design system. dark mode like the web app — editorial / co-star.
 * uses react-pdf built-in fonts (Helvetica + Times) to avoid CDN fetch latency.
 * Times-Italic carries the serif-italic moments. Helvetica handles body.
 */
export const COLORS = {
  ink: "#0a0a0a",
  paper: "#f5f3ee",
  paperMuted: "rgba(245, 243, 238, 0.62)",
  paperFaint: "rgba(245, 243, 238, 0.38)",
  line: "rgba(245, 243, 238, 0.18)",
};

export const styles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.ink,
    color: COLORS.paper,
    paddingTop: 56,
    paddingBottom: 56,
    paddingHorizontal: 56,
    fontFamily: "Helvetica",
    fontSize: 10.5,
    lineHeight: 1.5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 36,
  },
  wordmark: {
    fontFamily: "Times-Italic",
    fontSize: 13,
    color: COLORS.paper,
  },
  meta: {
    fontFamily: "Helvetica",
    fontSize: 8,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: COLORS.paperFaint,
  },
  title: {
    fontFamily: "Times-Italic",
    fontSize: 32,
    lineHeight: 1.05,
    letterSpacing: -0.6,
    color: COLORS.paper,
    marginBottom: 28,
  },
  subtitle: {
    fontFamily: "Times-Italic",
    fontSize: 18,
    lineHeight: 1.2,
    color: COLORS.paper,
    marginBottom: 22,
  },
  sectionLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: COLORS.paperFaint,
    marginBottom: 8,
    marginTop: 18,
  },
  body: {
    fontFamily: "Helvetica",
    fontSize: 10.5,
    lineHeight: 1.55,
    color: COLORS.paper,
    marginBottom: 12,
  },
  bodyMuted: {
    fontFamily: "Helvetica",
    fontSize: 10.5,
    lineHeight: 1.55,
    color: COLORS.paperMuted,
    marginBottom: 12,
  },
  serifBody: {
    fontFamily: "Times-Roman",
    fontSize: 11.5,
    lineHeight: 1.6,
    color: COLORS.paper,
    marginBottom: 14,
  },
  hr: {
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.line,
    marginVertical: 18,
  },
  callout: {
    borderLeftWidth: 1,
    borderLeftColor: COLORS.paperFaint,
    paddingLeft: 12,
    marginVertical: 14,
  },
  weekRow: {
    marginBottom: 18,
  },
  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 6,
  },
  weekNumber: {
    fontFamily: "Times-Italic",
    fontSize: 14,
    color: COLORS.paper,
  },
  weekDate: {
    fontFamily: "Helvetica",
    fontSize: 8,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: COLORS.paperFaint,
  },
  weekHeadline: {
    fontFamily: "Times-Italic",
    fontSize: 13,
    color: COLORS.paper,
    marginBottom: 4,
  },
  pageFooter: {
    position: "absolute",
    bottom: 24,
    left: 56,
    right: 56,
    flexDirection: "row",
    justifyContent: "space-between",
    fontFamily: "Helvetica",
    fontSize: 7,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: COLORS.paperFaint,
  },
});
