import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import axios from "axios";
axios.defaults.baseURL = 'http://47.113.194.193:3000';
import { ChatFeed, Message } from "react-chat-ui";
import analytics from "../../lib/analytics";
import { useUser } from "../../lib/user";

let anonymousID = null;

const Attention = () => {
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      // console.log("Identifying to June", user);
      analytics.identify({
        userId: user.id,
        traits: {
          email: user.email,
        },
      });
    } else {
      // Get this user's anonymous ID from localStorage, or make a new one
      // anonymousID = localStorage.getItem("anonymousID");
      // if (!anonymousID) {
      //   anonymousID = Math.random().toString(36).substring(7);
      //   localStorage.setItem("anonymousID", anonymousID);
      // }

      // console.log("Identifying to June", anonymousID);

      analytics.identify({
        anonymousId: anonymousID,
      });
    }
  }, [user]);

  const paper = {
    id: 1,
    title: "Attention Is All You Need",
    authors: [
      "Ashish Vaswani",
      "Noam Shazeer",
      "Niki Parmar",
      "Jakob Uszkoreit",
      "Llion Jones",
      "Aidan N Gomez",
      "Lukasz Kaiser",
      "Alec Radford",
    ],
    url: "https://arxiv.org/abs/1706.03762",

    paragraphs: [
      {
        section: "Abstract",
        text: "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train. Our model achieves 28.4 BLEU on the WMT 2014 English-to-German translation task, improving over the existing best results, including ensembles, by over 2 BLEU. On the WMT 2014 English-to-French translation task, our model establishes a new single-model state-of-the-art BLEU score of 41.8 after training for 3.5 days on eight GPUs, a small fraction of the training costs of the best models from the literature. We show that the Transformer generalizes well to other tasks by applying it successfully to English constituency parsing both with large and limited training data.",
      },
      {
        section: "1. Introduction",
        text: "Recurrent neural networks, long short-term memory [13] and gated recurrent [7] neural networks in particular, have been firmly established as state of the art approaches in sequence modeling and transduction problems such as language modeling and machine translation [35, 2, 5]. Numerous efforts have since continued to push the boundaries of recurrent language models and encoder-decoder architectures [38, 24, 15]. Recurrent models typically factor computation along the symbol positions of the input and output sequences. Aligning the positions to steps in computation time, they generate a sequence of hidden states ht, as a function of the previous hidden state ht−1 and the input for position t. This inherently sequential nature precludes parallelization within training examples, which becomes critical at longer sequence lengths, as memory constraints limit batching across examples. Recent work has achieved significant improvements in computational efficiency through factorization tricks [21] and conditional computation [32], while also improving model performance in case of the latter. The fundamental constraint of sequential computation, however, remains. Attention mechanisms have become an integral part of compelling sequence modeling and transduction models in various tasks, allowing modeling of dependencies without regard to their distance in the input or output sequences [2, 19]. In all but a few cases [27], however, such attention mechanisms are used in conjunction with a recurrent network. In this work we propose the Transformer, a model architecture eschewing recurrence and instead relying entirely on an attention mechanism to draw global dependencies between input and output. The Transformer allows for significantly more parallelization and can reach a new state of the art in translation quality after being trained for as little as twelve hours on eight P100 GPUs.",
      },
      {
        section: "1. Introduction",
        text: "Recurrent models typically factor computation along the symbol positions of the input and output sequences. Aligning the positions to steps in computation time, they generate a sequence of hidden states ht, as a function of the previous hidden state ht−1 and the input for position t. This inherently sequential nature precludes parallelization within training examples, which becomes critical at longer sequence lengths, as memory constraints limit batching across examples. Recent work has achieved significant improvements in computational efficiency through factorization tricks [21] and conditional computation [32], while also improving model performance in case of the latter. The fundamental constraint of sequential computation, however, remains.",
      },
      {
        section: "1. Introduction",
        text: "Attention mechanisms have become an integral part of compelling sequence modeling and transduction models in various tasks, allowing modeling of dependencies without regard to their distance in the input or output sequences [2, 19]. In all but a few cases [27], however, such attention mechanisms are used in conjunction with a recurrent network.",
      },
      {
        section: "1. Introduction",
        text: "In this work we propose the Transformer, a model architecture eschewing recurrence and instead relying entirely on an attention mechanism to draw global dependencies between input and output. The Transformer allows for significantly more parallelization and can reach a new state of the art in translation quality after being trained for as little as twelve hours on eight P100 GPUs.",
      },
      {
        section: "2. Background",
        text: "The goal of reducing sequential computation also forms the foundation of the Extended Neural GPU [16], ByteNet [18] and ConvS2S [9], all of which use convolutional neural networks as basic building block, computing hidden representations in parallel for all input and output positions. In these models, the number of operations required to relate signals from two arbitrary input or output positions grows in the distance between positions, linearly for ConvS2S and logarithmically for ByteNet. This makes it more difficult to learn dependencies between distant positions [12]. In the Transformer this is reduced to a constant number of operations, albeit at the cost of reduced effective resolution due to averaging attention-weighted positions, an effect we counteract with Multi-Head Attention as described in section 3.2.",
      },
      {
        section: "2. Background",
        text: "Self-attention, sometimes called intra-attention is an attention mechanism relating different positions of a single sequence in order to compute a representation of the sequence. Self-attention has been used successfully in a variety of tasks including reading comprehension, abstractive summarization, textual entailment and learning task-independent sentence representations [4, 27, 28, 22].",
      },
      {
        section: "2. Background",
        text: "End-to-end memory networks are based on a recurrent attention mechanism instead of sequencealigned recurrence and have been shown to perform well on simple-language question answering and language modeling tasks [34].",
      },
      {
        section: "2. Background",
        text: "To the best of our knowledge, however, the Transformer is the first transduction model relying entirely on self-attention to compute representations of its input and output without using sequencealigned RNNs or convolution. In the following sections, we will describe the Transformer, motivate self-attention and discuss its advantages over models such as [17, 18] and [9].",
      },
      {
        section: "3. Model Architecture",
        text: "Most competitive neural sequence transduction models have an encoder-decoder structure [5, 2, 35]. Here, the encoder maps an input sequence of symbol representations (x1,...,xn) to a sequence of continuous representations z = (z1,...,zn). Given z, the decoder then generates an output sequence (y1,...,ym) of symbols one element at a time. At each step the model is auto-regressive [10], consuming the previously generated symbols as additional input when generating the next.",
      },
      {
        section: "3. Model Architecture",
        text: "The Transformer follows this overall architecture using stacked self-attention and point-wise, fully connected layers for both the encoder and decoder, shown in the left and right halves of Figure 1, respectively.",
      },
      {
        section: "3.1 Encoder and Decoder Stacks",
        text: "Encoder: The encoder is composed of a stack of N = 6 identical layers. Each layer has two sub-layers. The first is a multi-head self-attention mechanism, and the second is a simple, positionwise fully connected feed-forward network. We employ a residual connection [11] around each of the two sub-layers, followed by layer normalization [1]. That is, the output of each sub-layer is LayerNorm(x + Sublayer(x)), where Sublayer(x) is the function implemented by the sub-layer itself. To facilitate these residual connections, all sub-layers in the model, as well as the embedding layers, produce outputs of dimension dmodel = 512.",
      },
      {
        section: "3.1 Encoder and Decoder Stacks",
        text: "Decoder: Thedecoder is also composed of a stack of N = 6 identical layers. In addition to the two sub-layers in each encoder layer, the decoder inserts a third sub-layer, which performs multi-head attention over the output of the encoder stack. Similar to the encoder, we employ residual connections around each of the sub-layers, followed by layer normalization. We also modify the self-attention sub-layer in the decoder stack to prevent positions from attending to subsequent positions. This masking, combined with fact that the output embeddings are offset by one position, ensures that the predictions for position i can depend only on the known outputs at positions less than i.",
      },
      {
        section: "3.2 Attention",
        text: "An attention function can be described as mapping a query and a set of key-value pairs to an output, where the query, keys, values, and output are all vectors. The output is computed as a weighted sum of the values, where the weight assigned to each value is computed by a compatibility function of the query with the corresponding key.",
      },
      {
        section: "3.2.1 Scaled Dot-Product Attention",
        text: "We call our particular attention 'Scaled Dot-Product Attention' (Figure 2). The input consists of queries and keys of dimension dk, and values of dimension dv. We compute the dot products of the query with all keys, divide each by √ dk, and apply a softmax function to obtain the weights on the values.",
      },
      // TODO: add the rest
      {
        section: "3.2.2 Multi-Head Attention",
        text: "Instead of performing a single attention function with dmodel-dimensional keys, values and queries, we found it beneficial to linearly project the queries, keys and values h times with different, learned linear projections to dk, dk and dv dimensions, respectively. On each of these projected versions of queries, keys and values we then perform the attention function in parallel, yielding dv-dimensional output values. These are concatenated and once again projected, resulting in the final values, as depicted in Figure 2.",
      },
      {
        section: "3.2.2 Multi-Head Attention",
        text: "Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions. With a single attention head, averaging inhibits this.",
      },
      {
        section: "3.2.2 Multi-Head Attention",
        text: "Where the projections are parameter matrices W Qi ∈ R dmodel×dk , W Ki ∈ R dmodel×dk , WV i ∈ R dmodel×dv and WO ∈ R hdv×dmodel.",
      },
      {
        section: "3.2.2 Multi-Head Attention",
        text: "In this work we employ h = 8 parallel attention layers, or heads. For each of these we use dk = dv = dmodel/h = 64. Due to the reduced dimension of each head, the total computational cost is similar to that of single-head attention with full dimensionality.",
      },
      {
        section: "3.2.3 Applications of Attention in our Model",
        text: "The Transformer uses multi-head attention in three different ways: \n • In 'encoder-decoder attention' layers, the queries come from the previous decoder layer,and the memory keys and values come from the output of the encoder. This allows every position in the decoder to attend over all positions in the input sequence. This mimics the typical encoder-decoder attention mechanisms in sequence-to-sequence models such as [38, 2, 9]. \n • The encoder contains self-attention layers. In a self-attention layer all of the keys, values and queries come from the same place, in this case, the output of the previous layer in the encoder. Each position in the encoder can attend to all positions in the previous layer of the encoder. \n • Similarly, self-attention layers in the decoder allow each position in the decoder to attend to all positions in the decoder up to and including that position. We need to prevent leftward information flow in the decoder to preserve the auto-regressive property. We implement this inside of scaled dot-product attention by masking out (setting to −∞) all values in the input of the softmax which correspond to illegal connections. See Figure 2.",
      },
      {
        section: "3.3 Position-wise Feed-Forward Networks",
        text: "In addition to attention sub-layers, each of the layers in our encoder and decoder contains a fully connected feed-forward network, which is applied to each position separately and identically. This consists of two linear transformations with a ReLU activation in between.",
      },
      {
        section: "3.3 Position-wise Feed-Forward Networks",
        text: "While the linear transformations are the same across different positions, they use different parameters from layer to layer. Another way of describing this is as two convolutions with kernel size 1. The dimensionality of input and output is dmodel = 512, and the inner-layer has dimensionality df f = 2048.",
      },
      {
        section: "3.4 Embeddings and Softmax",
        text: "Similarly to other sequence transduction models, we use learned embeddings to convert the input tokens and output tokens to vectors of dimension dmodel. We also use the usual learned linear transformation and softmax function to convert the decoder output to predicted next-token probabilities. In our model, we share the same weight matrix between the two embedding layers and the pre-softmax linear transformation, similar to [30]. In the embedding layers, we multiply those weights by √ dmodel.",
      },
      {
        section: "3.5 Positional Encoding",
        text: "Since our model contains no recurrence and no convolution, in order for the model to make use of the order of the sequence, we must inject some information about the relative or absolute position of the tokens in the sequence. To this end, we add 'positional encodings' to the input embeddings at the bottoms of the encoder and decoder stacks. The positional encodings have the same dimension dmodel as the embeddings, so that the two can be summed. There are many choices of positional encodings, learned and fixed [9].",
      },
      {
        section: "3.5 Positional Encoding",
        text: "In this work, we use sine and cosine functions of different frequencies: where pos is the position and i is the dimension. That is, each dimension of the positional encoding corresponds to a sinusoid. The wavelengths form a geometric progression from 2π to 10000 · 2π. We chose this function because we hypothesized it would allow the model to easily learn to attend by relative positions, since for any fixed offset k, P Epos+k can be represented as a linear function of P Epos.",
      },
      {
        section: "3.5 Positional Encoding",
        text: "We also experimented with using learned positional embeddings [9] instead, and found that the two versions produced nearly identical results (see Table 3 row (E)). We chose the sinusoidal version because it may allow the model to extrapolate to sequence lengths longer than the ones encountered during training.",
      },
      {
        section: "4 Why Self-Attention",
        text: "In this section we compare various aspects of self-attention layers to the recurrent and convolutional layers commonly used for mapping one variable-length sequence of symbol representations (x1, ..., xn) to another sequence of equal length (z1, ..., zn), with xi, zi ∈ R d , such as a hidden layer in a typical sequence transduction encoder or decoder. Motivating our use of self-attention we consider three desiderata.",
      },
      {
        section: "4 Why Self-Attention",
        text: "One is the total computational complexity per layer. Another is the amount of computation that can be parallelized, as measured by the minimum number of sequential operations required.",
      },
      {
        section: "4 Why Self-Attention",
        text: "The third is the path length between long-range dependencies in the network. Learning long-range dependencies is a key challenge in many sequence transduction tasks. One key factor affecting the ability to learn such dependencies is the length of the paths forward and backward signals have to traverse in the network. The shorter these paths between any combination of positions in the input and output sequences, the easier it is to learn long-range dependencies [12]. Hence we also compare the maximum path length between any two input and output positions in networks composed of the different layer types.",
      },
      {
        section: "4 Why Self-Attention",
        text: "As noted in Table 1, a self-attention layer connects all positions with a constant number of sequentially executed operations, whereas a recurrent layer requires O(n) sequential operations. In terms of computational complexity, self-attention layers are faster than recurrent layers when the sequence length n is smaller than the representation dimensionality d, which is most often the case with sentence representations used by state-of-the-art models in machine translations, such as word-piece [38] and byte-pair [31] representations. To improve computational performance for tasks involving very long sequences, self-attention could be restricted to considering only a neighborhood of size r in the input sequence centered around the respective output position. This would increase the maximum path length to O(n/r). We plan to investigate this approach further in future work.",
      },
      {
        section: "4 Why Self-Attention",
        text: "A single convolutional layer with kernel width k < n does not connect all pairs of input and output positions. Doing so requires a stack of O(n/k) convolutional layers in the case of contiguous kernels, or O(logk(n)) in the case of dilated convolutions [18], increasing the length of the longest paths between any two positions in the network. Convolutional layers are generally more expensive than recurrent layers, by a factor of k. Separable convolutions [6], however, decrease the complexity considerably, to O(k · n · d + n · d 2 ). Even with k = n, however, the complexity of a separable convolution is equal to the combination of a self-attention layer and a point-wise feed-forward layer, the approach we take in our model.",
      },
      {
        section: "4 Why Self-Attention",
        text: "As side benefit, self-attention could yield more interpretable models. We inspect attention distributions from our models and present and discuss examples in the appendix. Not only do individual attention heads clearly learn to perform different tasks, many appear to exhibit behavior related to the syntactic and semantic structure of the sentences.",
      },
      {
        section: "5 Training",
        text: "This section describes the training regime for our models.",
      },
      {
        section: "5.1 Training Data and Batching",
        text: "We trained on the standard WMT 2014 English-German dataset consisting of about 4.5 million sentence pairs. Sentences were encoded using byte-pair encoding [3], which has a shared sourcetarget vocabulary of about 37000 tokens. For English-French, we used the significantly larger WMT 2014 English-French dataset consisting of 36M sentences and split tokens into a 32000 word-piece vocabulary [38]. Sentence pairs were batched together by approximate sequence length. Each training batch contained a set of sentence pairs containing approximately 25000 source tokens and 25000 target tokens.",
      },
      {
        section: "5.2 Hardware and Schedule",
        text: "We trained our models on one machine with 8 NVIDIA P100 GPUs. For our base models using the hyperparameters described throughout the paper, each training step took about 0.4 seconds. We trained the base models for a total of 100,000 steps or 12 hours. For our big models,(described on the bottom line of table 3), step time was 1.0 seconds. The big models were trained for 300,000 steps (3.5 days).",
      },
      {
        section: "5.3 Optimizer",
        text: "We used the Adam optimizer [20] with β1 = 0.9, β2 = 0.98 and  = 10−9. We varied the learning rate over the course of training, according to the formula:",
      },
      {
        section: "5.3 Optimizer",
        text: "This corresponds to increasing the learning rate linearly for the first warmup_steps training steps, and decreasing it thereafter proportionally to the inverse square root of the step number. We used warmup_steps = 4000.",
      },
      {
        section: "5.4 Regularization",
        text: "We employ three types of regularization during training:",
      },
      {
        section: "5.4 Regularization",
        text: "Residual Dropout We apply dropout [33] to the output of each sub-layer, before it is added to the sub-layer input and normalized. In addition, we apply dropout to the sums of the embeddings and the positional encodings in both the encoder and decoder stacks. For the base model, we use a rate of Pdrop = 0.1.",
      },
      {
        section: "5.4 Regularization",
        text: "Label Smoothing During training, we employed label smoothing of value ls = 0.1 [36]. This hurts perplexity, as the model learns to be more unsure, but improves accuracy and BLEU score.",
      },
      {
        section: "6 Results",
        text: "",
      },
      {
        section: "6.1 Machine Translation",
        text: "On the WMT 2014 English-to-German translation task, the big transformer model (Transformer (big) in Table 2) outperforms the best previously reported models (including ensembles) by more than 2.0 BLEU, establishing a new state-of-the-art BLEU score of 28.4. The configuration of this model is listed in the bottom line of Table 3. Training took 3.5 days on 8 P100 GPUs. Even our base model surpasses all previously published models and ensembles, at a fraction of the training cost of any of the competitive models.",
      },
      {
        section: "6.1 Machine Translation",
        text: "On the WMT 2014 English-to-French translation task, our big model achieves a BLEU score of 41.0, outperforming all of the previously published single models, at less than 1/4 the training cost of the previous state-of-the-art model. The Transformer (big) model trained for English-to-French used dropout rate Pdrop = 0.1, instead of 0.3.",
      },
      {
        section: "6.1 Machine Translation",
        text: "For the base models, we used a single model obtained by averaging the last 5 checkpoints, which were written at 10-minute intervals. For the big models, we averaged the last 20 checkpoints. We used beam search with a beam size of 4 and length penalty α = 0.6 [38]. These hyperparameters were chosen after experimentation on the development set. We set the maximum output length during inference to input length + 50, but terminate early when possible [38].",
      },
      {
        section: "6.1 Machine Translation",
        text: "Table 2 summarizes our results and compares our translation quality and training costs to other model architectures from the literature. We estimate the number of floating point operations used to train a model by multiplying the training time, the number of GPUs used, and an estimate of the sustained single-precision floating-point capacity of each GPU 5.",
      },
      {
        section: "6.2 Model Variations",
        text: "To evaluate the importance of different components of the Transformer, we varied our base model in different ways, measuring the change in performance on English-to-German translation on the development set, newstest2013. We used beam search as described in the previous section, but no checkpoint averaging. We present these results in Table 3.",
      },
      {
        section: "6.2 Model Variations",
        text: "In Table 3 rows (A), we vary the number of attention heads and the attention key and value dimensions, keeping the amount of computation constant, as described in Section 3.2.2. While single-head attention is 0.9 BLEU worse than the best setting, quality also drops off with too many heads.",
      },
      {
        section: "6.2 Model Variations",
        text: "In Table 3 rows (B), we observe that reducing the attention key size dk hurts model quality. This suggests that determining compatibility is not easy and that a more sophisticated compatibility function than dot product may be beneficial. We further observe in rows (C) and (D) that, as expected, bigger models are better, and dropout is very helpful in avoiding over-fitting. In row (E) we replace our sinusoidal positional encoding with learned positional embeddings [9], and observe nearly identical results to the base model.",
      },
      {
        section: "6.3 English Constituency Parsing",
        text: "To evaluate if the Transformer can generalize to other tasks we performed experiments on English constituency parsing. This task presents specific challenges: the output is subject to strong structural constraints and is significantly longer than the input. Furthermore, RNN sequence-to-sequence models have not been able to attain state-of-the-art results in small-data regimes [37].",
      },
      {
        section: "6.3 English Constituency Parsing",
        text: "We trained a 4-layer transformer with dmodel = 1024 on the Wall Street Journal (WSJ) portion of the Penn Treebank [25], about 40K training sentences. We also trained it in a semi-supervised setting, using the larger high-confidence and BerkleyParser corpora from with approximately 17M sentences [37]. We used a vocabulary of 16K tokens for the WSJ only setting and a vocabulary of 32K tokens for the semi-supervised setting.",
      },
      {
        section: "6.3 English Constituency Parsing",
        text: "We performed only a small number of experiments to select the dropout, both attention and residual (section 5.4), learning rates and beam size on the Section 22 development set, all other parameters remained unchanged from the English-to-German base translation model. During inference, we increased the maximum output length to input length + 300. We used a beam size of 21 and α = 0.3 for both WSJ only and the semi-supervised setting.",
      },
      {
        section: "6.3 English Constituency Parsing",
        text: "Our results in Table 4 show that despite the lack of task-specific tuning our model performs sur- prisingly well, yielding better results than all previously reported models with the exception of the Recurrent Neural Network Grammar [8].",
      },
      {
        section: "6.3 English Constituency Parsing",
        text: "In contrast to RNN sequence-to-sequence models [37], the Transformer outperforms the Berkeley- Parser [29] even when training only on the WSJ training set of 40K sentences.",
      },
      {
        section: "7 Conclusion",
        text: "In this work, we presented the Transformer, the first sequence transduction model based entirely on attention, replacing the recurrent layers most commonly used in encoder-decoder architectures with multi-headed self-attention.",
      },
      {
        section: "7 Conclusion",
        text: "For translation tasks, the Transformer can be trained significantly faster than architectures based on recurrent or convolutional layers. On both WMT 2014 English-to-German and WMT 2014 English-to-French translation tasks, we achieve a new state of the art. In the former task our best model outperforms even all previously reported ensembles.",
      },
      {
        section: "7 Conclusion",
        text: "We are excited about the future of attention-based models and plan to apply them to other tasks. We plan to extend the Transformer to problems involving input and output modalities other than text and to investigate local, restricted attention mechanisms to efficiently handle large inputs and outputs such as images, audio and video. Making generation less sequential is another research goals of ours.",
      },
      {
        section: "7 Conclusion",
        text: "The code we used to train and evaluate our models is available at https://github.com/tensorflow/tensor2tensor.",
      },
      {
        section: "7 Conclusion",
        text: "Acknowledgements We are grateful to Nal Kalchbrenner and Stephan Gouws for their fruitful comments, corrections and inspiration.",
      },
      // TODO: 6.2 and onward
    ],
  };
  const sections =
    paper.paragraphs
      .map((paragraph) => paragraph.section)
      .filter((section, index, self) => self.indexOf(section) === index) || [];
  const authors = paper.authors || [];
  const title = "Attention Is All You Need";
  const url = "https://arxiv.org/abs/1706.03762";
  const firstFewAuthors = authors.slice(0, 3);
  const remainingAuthors = authors.slice(3, authors.length);
  const [open, setOpen] = useState(false);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]); // chat messages

  const [highlightedString, setHighlightedString] = useState("");
  const [explanation, setExplanation] = useState("");
  // const isMobile = window.matchMedia(
  //   "only screen and (max-width: 480px)"
  // ).matches; // check if mobile

  const fetchApiExplanation = async (
    paragraph: string,
    text: string,
    userID: string
  ) => {
    setExplanation("...");
    // The paragraph we use is the one in paper.paragraphs which matches the highlighted string

    const res = await axios.post("/api/attention_explain", {
      paragraph,
      text,
      userID,
    });
    return res.data.data;
  };

  // Messages handling
  const [chatLog, setChatLog] =
    useState(`The following is the abstract for an AI paper introducing a new model. Answer questions from a reader about to read the paper with 0 pre-existing knowledge of AI or ML.
Abstract:
The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best-performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train. Our model achieves 28.4 BLEU on the WMT 2014 English-to-German translation task, improving the best results, including ensembles, by over 2 BLEU. On the WMT 2014 English-to-French translation task, our model establishes a new single-model state-of-the-art BLEU score of 41.8 after training for 3.5 days on eight GPUs, a small fraction of the training costs of the best models from the literature. We show that the Transformer generalizes well to other tasks by applying it successfully to English constituency parsing both with large and limited training data.
Question: what is a transduction model?
Answer: A transduction model is a type of machine learning model that is used to transform one sequence of data into another. Transduction models are often used for tasks such as machine translation, where the goal is to translate a sequence of text from one language to another.
Question: `);

  function askQuestion(input: string) {
    // Add the user msg in the meantime
    setMessages([
      ...messages,
      {
        id: 0,
        message: input,
      },
    ]);

    const prompt =
      chatLog +
      input +
      `
Answer:`;
    setChatLog(prompt);
    setInput("");

    AnswerQuestion(prompt).then((resp) => {
      // console.log(messages);

      // Re-add the user msg plus the answer msg
      setMessages([
        ...messages,
        {
          id: 0,
          message: input,
        },
        {
          id: 1,
          message: resp,
        },
      ]);

      // Update the chat log
      setChatLog(
        prompt +
          resp +
          `
Question: `
      );
    });
  }

  const AnswerQuestion = async (newPrompt: string) => {
    const res = await axios.post("/api/answer", {
      prompt: newPrompt,
    });

    return res.data.data;
  };

  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="w-full flex mx-2 rounded-xl h-[92vh] flex-col bg-[#f5f5f5] dark:bg-[#1C1917]">
      <div className="flex flex-1 h-[50vh]">
        {/* Paper */}
        <div className="flex flex-col w-5/6 pb-8 overflow-y-scroll no-scrollbar">
          {/* Header */}
          <div className="py-5 border-[#727272] w-full  pl-11">
            <Head>
              <title>{title}</title>
              <meta name="description" content="Attention Is All You Need" />
              <link rel="icon" href="/favicon.ico" />
            </Head>
            <h1 className="text-[24px] font-bold text-black dark:text-white pt-8">
              {title}
            </h1>
            <a
              className="text-black/70 dark:text-white/80 dark:hover:text-white hover:text-black text-sm font-light pb-0.5"
              href={url}
            >
              Original paper
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="inline-block w-3 h-3 text-inherit "
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
                />
              </svg>
            </a>
          </div>
          {/* authors */}
          <div className="mx-11 mt-8">
            <h1 className="pb-3 text-xl font-bold text-black dark:text-white">
              Authors
            </h1>
            {firstFewAuthors.map((author) => (
              <p key={author} className="font-serif text-black dark:text-white">
                {author}
              </p>
            ))}
            {authors.length > 3 && (
              <div className="">
                {open &&
                  remainingAuthors.map((author) => {
                    return (
                      <p
                        key={author}
                        className="font-serif text-black dark:text-white"
                      >
                        {author}
                      </p>
                    );
                  })}
                <button
                  className="text-sm font-light text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white"
                  onClick={() => setOpen(!open)}
                >
                  {open ? "Hide" : "Show more"}
                </button>
              </div>
            )}
          </div>
          {/* Text of the paper */}
          {sections.map((section) => (
            <div key={section} className="w-full mx-11 mt-12">
              <h1 className="pb-3 text-xl font-bold text-black dark:text-white">
                {section}
              </h1>
              {paper.paragraphs.map((paragraph) => {
                if (paragraph.section === section) {
                  return (
                    <p
                      key={paragraph.text}
                      className=" font-serif pb-4 tracking-wide text-black dark:text-white lg:w-[750px] md:w-3/4 w-full"
                      onMouseUpCapture={() => {
                        const highlight = window.getSelection()?.toString();

                        setHighlightedString(highlight || highlightedString);

                        if (highlight) {
                          fetchApiExplanation(
                            paragraph.text as string,
                            highlight,
                            user!?.id
                          ).then((resp) => {
                            // console.log("Tracking");
                            analytics.track({
                              userId: user?.id,
                              anonymousId: anonymousID,
                              event: "Highlight Explanation",
                              properties: {
                                input_highlighted: highlight,
                                output_explanation: resp,
                                paper: "Attention Is All You Need",
                              },
                            });
                            setExplanation(resp);
                          });
                        }
                      }}
                    >
                      {paragraph.text}
                    </p>
                  );
                }
              })}
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="invisible sm:visible justify-between flex flex-col lg:w-2/5 md:w-1/3 border-l-2 mb-10 border-[#727272] overflow-hidden mt-14">
          {/* Explanation */}
          <div className="w-full h-fit border-[#727272] bg-[#f5f5f5] dark:bg-[#1C1917]">
            <div className="flex flex-col mx-5 my-2 space-y-2">
              <p className="text-sm font-bold text-black dark:text-white">
                {highlightedString ? (
                  <span className="text-black bg-yellow-500/70 dark:bg-yellow-400 font-normal px-1 py-0.5">
                    {highlightedString}
                  </span>
                ) : (
                  <span className="text-base font-medium text-yellow-600 dark:text-yellow-500">
                    Highlight any text to explain it
                  </span>
                )}
              </p>
              {explanation !== "" && (
                <p className="text-sm text-black dark:text-white">
                  {explanation}
                </p>
              )}
            </div>
          </div>
          {/* Chat */}
          <div className="px-5 overflow-y-auto">
            <div className="px-3 pb-5">
              <ChatFeed
                messages={messages} // Array: list of message objects
                //isTyping={is_loading} // Boolean: is the recipient typing
                hasInputField={false} // Boolean: use our input, or use your own
                showSenderName // show the name of the user who sent the message
                bubblesCentered={false} //Boolean should the bubbles be centered in the feed?
                // JSON: Custom bubble styles
                bubbleStyles={{
                  text: {
                    fontSize: 14,
                  },
                  userBubble: {
                    borderRadius: 20,
                    padding: 11,
                    backgroundColor: "#0ea4e9",
                  },
                  chatbubble: {
                    borderRadius: 20,
                    padding: 11,
                    backgroundColor: "#a3a3a3",
                  },
                }}
              />
              <div ref={messagesEndRef} className="" />
            </div>
            {/* Chat Input */}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="resize-none rounded-md w-full bg-[#f5f5f5] dark:bg-[#292524] border-[1px] border-[#727272] text-black dark:text-white px-3 py-2 h-24 no-scrollbar outline-none"
              placeholder="Ask a question about the paper..."
              // on enter, submit the message
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  askQuestion(input);
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attention;
