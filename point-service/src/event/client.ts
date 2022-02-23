import amqp from 'amqplib';

const connection = async (AMQP_HOST: string) => await amqp.connect(AMQP_HOST);

export { connection };