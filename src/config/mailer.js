import dns from "node:dns/promises";
import nodemailer from "nodemailer";

// nodemailer resolves both A and AAAA records for the SMTP host and picks a
// random address to connect to. Some hosts (e.g. Render) report an
// IPv6-capable network interface but can't actually route IPv6 traffic out
// to the internet, so an IPv6 pick fails with ENETUNREACH/timeout. Resolving
// to an IPv4 address ourselves and connecting to that literal IP makes
// nodemailer skip its own DNS resolution entirely (it only resolves
// hostnames, not IPs). `tls.servername` keeps SNI/certificate validation
// pointed at the real hostname.
const getTransporter = async () => {
  const host = process.env.SMTP_HOST;
  let connectHost = host;

  try {
    const { address } = await dns.lookup(host, { family: 4 });
    connectHost = address;
  } catch (error) {
    console.error(
      `Failed to resolve ${host} to an IPv4 address, falling back to hostname:`,
      error.message,
    );
  }

  return nodemailer.createTransport({
    host: connectHost,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      servername: host,
    },
  });
};

export default getTransporter;
