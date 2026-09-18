import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";

const PLAYFAIR = "'Playfair Display', Georgia, serif";
const MONTSERRAT = "'Montserrat', Helvetica, Arial, sans-serif";

export interface LigneRecap {
  label: string;
  valeur: string;
}

interface EmailLayoutProps {
  apercu: string;
  titre: string;
  intro: string;
  motif?: string;
  lignes: LigneRecap[];
  bouton?: { texte: string; href: string };
  rappel: string;
  adresse: string;
  telephoneAffiche: string | null;
}

/** Gabarit commun des trois emails — voir docs/reservation/05-emails.md. */
export default function EmailLayout({
  apercu,
  titre,
  intro,
  motif,
  lignes,
  bouton,
  rappel,
  adresse,
  telephoneAffiche,
}: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{apercu}</Preview>
      <Body style={{ backgroundColor: "#F5F5DC", margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: 600, margin: "0 auto", padding: 0 }}>
          {/* En-tête */}
          <Section style={{ backgroundColor: "#800020", padding: "28px 32px", textAlign: "center" }}>
            <Text
              style={{
                margin: 0,
                fontFamily: MONTSERRAT,
                fontSize: 11,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#F5F5DC",
              }}
            >
              L'Intemporel
            </Text>
            <Heading
              style={{
                margin: "8px 0 0",
                fontFamily: PLAYFAIR,
                fontSize: 24,
                fontWeight: 600,
                color: "#F5F5DC",
              }}
            >
              {titre}
            </Heading>
          </Section>

          {/* Corps */}
          <Section style={{ padding: "28px 32px" }}>
            <Text style={{ fontFamily: MONTSERRAT, fontSize: 14, lineHeight: 1.75, color: "#6b2135" }}>
              {intro}
            </Text>

            {motif && (
              <Section
                style={{
                  backgroundColor: "#E8E8CC",
                  borderRadius: 10,
                  padding: "12px 16px",
                  margin: "0 0 16px",
                }}
              >
                <Text style={{ margin: 0, fontFamily: MONTSERRAT, fontSize: 13, color: "#6b2135" }}>
                  <strong>Motif</strong> · {motif}
                </Text>
              </Section>
            )}

            <Section
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #d9d4b4",
                borderRadius: 12,
                padding: "16px 18px",
                margin: "16px 0",
              }}
            >
              {lignes.map((l) => (
                <Row key={l.label} style={{ padding: "4px 0" }}>
                  <Column>
                    <Text style={{ margin: 0, fontFamily: MONTSERRAT, fontSize: 13, color: "#7d4152" }}>
                      {l.label}
                    </Text>
                  </Column>
                  <Column align="right">
                    <Text
                      style={{
                        margin: 0,
                        fontFamily: MONTSERRAT,
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#6b2135",
                      }}
                    >
                      {l.valeur}
                    </Text>
                  </Column>
                </Row>
              ))}
            </Section>

            {bouton && (
              <Button
                href={bouton.href}
                style={{
                  display: "block",
                  width: "100%",
                  backgroundColor: "#800020",
                  color: "#F5F5DC",
                  fontFamily: MONTSERRAT,
                  fontSize: 14,
                  fontWeight: 600,
                  textAlign: "center",
                  padding: "14px 0",
                  borderRadius: 10,
                }}
              >
                {bouton.texte}
              </Button>
            )}

            <Text
              style={{
                textAlign: "center",
                fontFamily: MONTSERRAT,
                fontSize: 11.5,
                color: "#7d4152",
                marginTop: 16,
              }}
            >
              {rappel}
            </Text>
          </Section>

          <Hr style={{ borderColor: "#f0ead4", margin: 0 }} />

          {/* Pied */}
          <Section style={{ padding: "20px 32px" }}>
            {adresse && (
              <Text style={{ margin: "0 0 4px", fontFamily: MONTSERRAT, fontSize: 12, color: "#7d4152" }}>
                {adresse}
              </Text>
            )}
            {telephoneAffiche && (
              <Text style={{ margin: "0 0 4px", fontFamily: MONTSERRAT, fontSize: 12, color: "#7d4152" }}>
                <a href={`tel:${telephoneAffiche.replace(/\s/g, "")}`} style={{ color: "#7d4152" }}>
                  {telephoneAffiche}
                </a>
              </Text>
            )}
            <Text style={{ margin: 0, fontFamily: MONTSERRAT, fontSize: 12, color: "#7d4152" }}>
              Vos coordonnées sont effacées 30 jours après votre venue.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
